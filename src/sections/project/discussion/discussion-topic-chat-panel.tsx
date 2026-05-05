import type { IProject } from 'src/domain/project';
import type { IDiscussionTopic } from 'src/domain/discussion';
import type { IChatMessage, IChatParticipant } from 'src/types/chat';

import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { today } from 'src/utils/format-time';

import { useGetContacts } from 'src/actions/chat';
import { sendDiscussionMessage, useDiscussionMessages } from 'src/actions/project-discussion';

import { Iconify } from 'src/components/iconify';

import { ChatRoom } from 'src/sections/chat/chat-room';
import { ChatMessageList } from 'src/sections/chat/chat-message-list';
import { ChatMessageInput } from 'src/sections/chat/chat-message-input';
import { useCollapseNav } from 'src/sections/chat/hooks/use-collapse-nav';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  project: IProject;
  topic: IDiscussionTopic;
  onBack: () => void;
};

export function DiscussionTopicChatPanel({ project, topic, onBack }: Props) {
  const roomNav = useCollapseNav();
  const { contacts } = useGetContacts();
  const { user } = useMockedUser();

  const { messages, messagesLoading } = useDiscussionMessages(project.id, topic.id);

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
      status: 'online' as const,
    }),
    [user]
  );

  const participants: IChatParticipant[] = useMemo(() => {
    const ownerParticipant: IChatParticipant = {
      id: project.ownerId,
      name: project.ownerName,
      role: '',
      email: '',
      address: '',
      avatarUrl: '',
      phoneNumber: '',
      lastActivity: today(),
      status: 'offline',
    };

    const fromContacts = contacts.filter((c) => c.id !== myContact.id).slice(0, 4);
    const merged = [myContact, ownerParticipant, ...fromContacts];
    const seen = new Set<string>();
    return merged.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [contacts, myContact, project.ownerId, project.ownerName]);

  const others = useMemo(
    () => participants.filter((p) => p.id !== myContact.id),
    [myContact.id, participants]
  );

  const handleSend = useCallback(
    async (messageData: IChatMessage) => {
      await sendDiscussionMessage(project.id, topic.id, messageData);
    },
    [project.id, topic.id]
  );

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        width: 1,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.customShadows.card,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          flexShrink: 0,
          height: 72,
          px: 1,
          borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <IconButton onClick={onBack} aria-label="Back to topics">
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Stack sx={{ flex: 1, minWidth: 0, mx: 1 }}>
          <Typography variant="subtitle1" noWrap title={topic.name}>
            {topic.name}
          </Typography>
          {topic.description ? (
            <Typography variant="caption" color="text.secondary" noWrap title={topic.description}>
              {topic.description}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.disabled">
              Discussion thread
            </Typography>
          )}
        </Stack>

        <IconButton
          onClick={roomNav.onOpenMobile}
          aria-label="Thread details and attachments"
        >
          <Iconify icon="ri:sidebar-unfold-fill" />
        </IconButton>
      </Stack>

      <Stack
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatMessageList messages={messages} participants={participants} loading={messagesLoading} />

        <ChatMessageInput
          disabled={false}
          recipients={[]}
          selectedConversationId={topic.id}
          onAddRecipients={() => {}}
          onSendMessageOverride={handleSend}
        />
      </Stack>

      <ChatRoom
        drawerOnly
        collapseNav={roomNav}
        participants={others}
        loading={messagesLoading}
        messages={messages}
      />
    </Box>
  );
}
