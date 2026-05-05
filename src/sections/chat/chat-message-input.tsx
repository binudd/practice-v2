import type { IChatMessage, IChatParticipant } from 'src/types/chat';

import { useRef, useMemo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { uuidv4 } from 'src/utils/uuidv4';
import { fSub, today } from 'src/utils/format-time';

import { sendMessage, createConversation } from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  disabled: boolean;
  recipients: IChatParticipant[];
  selectedConversationId: string;
  onAddRecipients: (recipients: IChatParticipant[]) => void;
  /**
   * When set, sends through this handler instead of dashboard chat actions
   * (e.g. embedded project discussion thread).
   */
  onSendMessageOverride?: (messageData: IChatMessage) => Promise<void>;
};

export function ChatMessageInput({
  disabled,
  recipients,
  onAddRecipients,
  selectedConversationId,
  onSendMessageOverride,
}: Props) {
  const router = useRouter();

  const { user } = useMockedUser();

  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');

  const myContact = useMemo(
    () => ({
      id: `${user?.id}`,
      role: `${user?.role}`,
      email: `${user?.email}`,
      address: `${user?.address}`,
      name: `${user?.displayName}`,
      lastActivity: today(),
      avatarUrl: `${user?.photoURL}`,
      phoneNumber: `${user?.phoneNumber}`,
      status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
    }),
    [user]
  );

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const sendPayload = useCallback(
    async (payload: IChatMessage) => {
      if (onSendMessageOverride) {
        await onSendMessageOverride(payload);
      } else if (selectedConversationId) {
        await sendMessage(selectedConversationId, payload);
      } else {
        const res = await createConversation({
          id: uuidv4(),
          messages: [payload],
          participants: [...recipients, myContact],
          type: recipients.length > 1 ? 'GROUP' : 'ONE_TO_ONE',
          unreadCount: 0,
        });

        router.push(`${paths.dashboard.chat}?id=${res.conversation.id}`);

        onAddRecipients([]);
      }
    },
    [
      myContact,
      onAddRecipients,
      onSendMessageOverride,
      recipients,
      router,
      selectedConversationId,
    ]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
          return;
        }

        if (file.type.startsWith('image/')) {
          const payload: IChatMessage = {
            id: uuidv4(),
            attachments: [],
            body: URL.createObjectURL(file),
            contentType: 'image',
            createdAt: fSub({ minutes: 1 }),
            senderId: myContact.id,
          };
          await sendPayload(payload);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [myContact.id, sendPayload]
  );

  const handleSendMessage = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter' && message) {
          const payload: IChatMessage = {
            id: uuidv4(),
            attachments: [],
            body: message,
            contentType: 'text',
            createdAt: fSub({ minutes: 1 }),
            senderId: myContact.id,
          };

          await sendPayload(payload);
          setMessage('');
        }
      } catch (error) {
        console.error(error);
      }
    },
    [message, myContact.id, sendPayload]
  );

  return (
    <>
      <InputBase
        name="chat-message"
        id="chat-message-input"
        value={message}
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        placeholder="Type a message"
        disabled={disabled}
        startAdornment={
          <IconButton>
            <Iconify icon="eva:smiling-face-fill" />
          </IconButton>
        }
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <IconButton onClick={handleAttach}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>
            <IconButton onClick={handleAttach}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
            <IconButton>
              <Iconify icon="solar:microphone-bold" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 1,
          height: 56,
          flexShrink: 0,
          borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      />

      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
