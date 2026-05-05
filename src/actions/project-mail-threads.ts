import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints } from 'src/utils/axios';

import { listMailThreadsByProject } from 'src/infra/api/project-mail-threads-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectMailThreadsKey(projectId: string) {
  return endpoints.projectMailThreads(projectId);
}

export function useProjectMailThreads(projectId: string | undefined) {
  const key = projectId ? projectMailThreadsKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listMailThreadsByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      mailThreads: list,
      mailThreadsLoading: isLoading,
      mailThreadsError: error,
      mailThreadsValidating: isValidating,
      mailThreadsEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}
