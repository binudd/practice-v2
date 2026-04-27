import type { IProject } from 'src/domain/project';

import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';

import { useBoolean } from 'src/hooks/use-boolean';

import { useDiscussionTopics } from 'src/actions/project-discussion';

import { useCurrentRole } from 'src/auth/hooks';

import { DiscussionTopicsNav } from './discussion-topics-nav';
import { DiscussionTopicChatPanel } from './discussion-topic-chat-panel';
import { DiscussionTopicCreateDialog } from './discussion-topic-create-dialog';

// ----------------------------------------------------------------------

const TOPIC_PARAM = 'topic';

type Props = {
  projectId: string;
  project: IProject;
};

export function ProjectDiscussionView({ projectId, project }: Props) {
  const openCreate = useBoolean();
  const role = useCurrentRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTopicId = searchParams.get(TOPIC_PARAM);
  const { topics, topicsLoading, topicsEmpty } = useDiscussionTopics(projectId);

  const selectedTopic = useMemo(
    () => (rawTopicId ? topics.find((t) => t.id === rawTopicId) : undefined),
    [rawTopicId, topics]
  );

  useEffect(() => {
    if (rawTopicId && !topicsLoading && !selectedTopic) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(TOPIC_PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawTopicId, selectedTopic, setSearchParams, topicsLoading]);

  const showInternalHint = role !== 'client';

  const openTopic = useCallback(
    (topicId: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(TOPIC_PARAM, topicId);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeTopic = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(TOPIC_PARAM);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  if (selectedTopic) {
    return (
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DiscussionTopicChatPanel project={project} topic={selectedTopic} onBack={closeTopic} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
          overflow: 'hidden',
        }}
      >
        <DiscussionTopicsNav
          topics={topics}
          loading={topicsLoading}
          empty={topicsEmpty}
          showInternalHint={showInternalHint}
          onSelectTopic={openTopic}
          onNewTopic={openCreate.onTrue}
        />
      </Box>

      <DiscussionTopicCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </Box>
  );
}
