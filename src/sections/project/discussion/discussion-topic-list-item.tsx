import type { IDiscussionTopic } from 'src/domain/discussion';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  topic: IDiscussionTopic;
  showInternalBadge?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function DiscussionTopicListItem({
  topic,
  showInternalBadge,
  selected,
  onSelect,
}: Props) {
  const secondaryText = useMemo(() => {
    const parts: string[] = [];
    if (topic.description) {
      parts.push(topic.description);
    }
    if (topic.attachments.length > 0) {
      parts.push(
        `${topic.attachments.length} attachment${topic.attachments.length > 1 ? 's' : ''}`
      );
    }
    if (parts.length === 0) {
      parts.push('Open thread to view messages');
    }
    return parts.join(' · ');
  }, [topic.attachments.length, topic.description]);

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={onSelect}
        sx={{
          py: 1.5,
          px: 2.5,
          gap: 2,
          ...(selected && { bgcolor: 'action.selected' }),
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
          }}
        >
          <Iconify icon="solar:chat-round-dots-bold" width={24} />
        </Avatar>

        <ListItemText
          primary={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Typography component="span" variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                {topic.name}
              </Typography>
              {showInternalBadge && topic.hiddenFromClient && (
                <Label color="warning" variant="soft" sx={{ flexShrink: 0 }}>
                  Internal
                </Label>
              )}
            </Stack>
          }
          secondary={secondaryText}
          primaryTypographyProps={{ noWrap: true, component: 'div' }}
          secondaryTypographyProps={{
            noWrap: true,
            component: 'span',
            variant: 'body2',
            color: 'text.secondary',
          }}
        />

        <Stack alignItems="flex-end" sx={{ alignSelf: 'stretch', flexShrink: 0 }}>
          <Typography
            noWrap
            variant="body2"
            component="span"
            sx={{ mb: 'auto', pt: 0.25, fontSize: 12, color: 'text.disabled' }}
          >
            {fToNow(topic.updatedAt)}
          </Typography>
        </Stack>
      </ListItemButton>
    </Box>
  );
}
