import useSWR from 'swr';
import { useMemo } from 'react';

import { endpoints } from 'src/utils/axios';

import { listActivityByProject } from 'src/infra/api/project-activity-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectActivityKey(projectId: string) {
  return endpoints.projectActivity(projectId);
}

export function useProjectActivity(projectId: string | undefined) {
  const key = projectId ? projectActivityKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listActivityByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      activity: list,
      activityLoading: isLoading,
      activityError: error,
      activityValidating: isValidating,
      activityEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}
