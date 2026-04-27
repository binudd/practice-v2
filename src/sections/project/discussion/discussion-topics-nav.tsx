import type { IDiscussionTopic } from 'src/domain/discussion';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { DiscussionTopicListItem } from './discussion-topic-list-item';

// ----------------------------------------------------------------------

type Props = {
  topics: IDiscussionTopic[];
  loading: boolean;
  empty: boolean;
  showInternalHint: boolean;
  onSelectTopic: (topicId: string) => void;
  onNewTopic: () => void;
};

export function DiscussionTopicsNav({
  topics,
  loading,
  empty,
  showInternalHint,
  onSelectTopic,
  onNewTopic,
}: Props) {
  const [query, setQuery] = useState('');

  const handleClickAwaySearch = useCallback(() => {
    setQuery('');
  }, []);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
    );
  }, [query, topics]);

  const renderSearchInput = (
    <ClickAwayListener onClickAway={handleClickAwaySearch}>
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search topics..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mt: 2.5 }}
      />
    </ClickAwayListener>
  );

  const renderList = (
    <nav>
      <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
        {filteredTopics.map((topic) => (
          <DiscussionTopicListItem
            key={topic.id}
            topic={topic}
            showInternalBadge={showInternalHint}
            selected={false}
            onSelect={() => onSelectTopic(topic.id)}
          />
        ))}
      </Box>
    </nav>
  );

  return (
    <Stack
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        width: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ p: 2.5, pb: 0 }}>
        <Typography variant="h6" sx={{ typography: { sm: 'h5' } }}>
          Discussion
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          size="medium"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onNewTopic}
        >
          New topic
        </Button>
      </Stack>

      {showInternalHint && topics.some((t) => t.hiddenFromClient) && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 2.5, pt: 1 }}>
          Topics marked Internal are hidden from client users.
        </Typography>
      )}

      <Box sx={{ p: 2.5, pt: 0 }}>{renderSearchInput}</Box>

      {loading ? (
        <ChatNavItemSkeleton />
      ) : empty ? (
        <Box sx={{ px: 2, py: 4 }}>
          <EmptyContent
            imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
            title="No topics yet"
            description="Create a topic to start a conversation with your team."
          />
        </Box>
      ) : filteredTopics.length === 0 ? (
        <Box sx={{ px: 2, py: 4 }}>
          <EmptyContent
            title="No matches"
            description="Try a different search."
          />
        </Box>
      ) : (
        <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
          {renderList}
        </Scrollbar>
      )}
    </Stack>
  );
}
