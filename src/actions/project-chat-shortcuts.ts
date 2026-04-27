import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints } from 'src/utils/axios';

import { listChatShortcutsByProject } from 'src/infra/api/project-chat-shortcuts-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectChatShortcutsKey(projectId: string) {
  return endpoints.projectChatShortcuts(projectId);
}

export function useProjectChatShortcuts(projectId: string | undefined) {
  const key = projectId ? projectChatShortcutsKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listChatShortcutsByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      chatShortcuts: list,
      chatShortcutsLoading: isLoading,
      chatShortcutsError: error,
      chatShortcutsValidating: isValidating,
      chatShortcutsEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}
