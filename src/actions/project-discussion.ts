import type { IChatMessage } from 'src/types/chat';
import type { IDiscussionTopic, CreateDiscussionTopicInput } from 'src/domain/discussion';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import {
  createDiscussionTopicApi,
  sendDiscussionMessageApi,
  listDiscussionMessagesByTopic,
  listDiscussionTopicsByProject,
} from 'src/infra/api/project-discussion-api';

import { useCurrentRole } from 'src/auth/hooks';
import { ALL_ROLES, type UserRole } from 'src/auth/roles';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function discussionTopicsKey(projectId: string) {
  return endpoints.projectDiscussionTopics(projectId);
}

export function discussionMessagesKey(projectId: string, topicId: string) {
  return [endpoints.projectDiscussionTopics(projectId), 'messages', topicId] as const;
}

type DiscussionSwrKey = readonly [string, UserRole | ''];

export function useDiscussionTopics(projectId: string | undefined) {
  const role = useCurrentRole();

  const swrKey: DiscussionSwrKey | null = projectId
    ? ([discussionTopicsKey(projectId), role ?? ''] as const)
    : null;

  const { data, isLoading, error, isValidating } = useSWR<IDiscussionTopic[]>(
    swrKey,
    () => listDiscussionTopicsByProject(projectId!, role),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      topics: list,
      topicsLoading: isLoading,
      topicsError: error,
      topicsValidating: isValidating,
      topicsEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

// ----------------------------------------------------------------------

export function useDiscussionMessages(projectId: string | undefined, topicId: string | null) {
  const key = projectId && topicId ? discussionMessagesKey(projectId, topicId) : null;

  const { data, isLoading, error, isValidating } = useSWR<IChatMessage[]>(
    key,
    () => listDiscussionMessagesByTopic(topicId!),
    swrOptions
  );

  return useMemo(() => {
    const messages = data ?? [];
    return {
      messages,
      messagesLoading: isLoading,
      messagesError: error,
      messagesValidating: isValidating,
    };
  }, [data, error, isLoading, isValidating]);
}

// ----------------------------------------------------------------------

export async function createDiscussionTopic(projectId: string, input: CreateDiscussionTopicInput) {
  await createDiscussionTopicApi(projectId, input);

  const roleKeys: (UserRole | '')[] = [...ALL_ROLES, ''];

  await Promise.all(
    roleKeys.map(async (roleKey) => {
      const roleForApi = roleKey === '' ? undefined : roleKey;
      const next = await listDiscussionTopicsByProject(projectId, roleForApi);
      await mutate([discussionTopicsKey(projectId), roleKey] as const, next, false);
    })
  );
}

// ----------------------------------------------------------------------

export async function sendDiscussionMessage(
  projectId: string,
  topicId: string,
  message: IChatMessage
) {
  await sendDiscussionMessageApi(projectId, topicId, message);

  const fresh = await listDiscussionMessagesByTopic(topicId);
  await mutate(discussionMessagesKey(projectId, topicId), fresh, false);

  const roleKeys: (UserRole | '')[] = [...ALL_ROLES, ''];

  await Promise.all(
    roleKeys.map(async (roleKey) => {
      const roleForApi = roleKey === '' ? undefined : roleKey;
      const next = await listDiscussionTopicsByProject(projectId, roleForApi);
      await mutate([discussionTopicsKey(projectId), roleKey] as const, next, false);
    })
  );
}
