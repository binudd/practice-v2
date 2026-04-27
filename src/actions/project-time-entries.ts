import type { CreateTimeEntryInput } from 'src/domain/time-entry';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createTimeEntryApi, listTimeEntriesByProject } from 'src/infra/api/project-time-entries-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectTimeEntriesKey(projectId: string) {
  return endpoints.projectTimeEntries(projectId);
}

export function useProjectTimeEntries(projectId: string | undefined) {
  const key = projectId ? projectTimeEntriesKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listTimeEntriesByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      timeEntries: list,
      timeEntriesLoading: isLoading,
      timeEntriesError: error,
      timeEntriesValidating: isValidating,
      timeEntriesEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectTimeEntry(projectId: string, input: CreateTimeEntryInput) {
  await createTimeEntryApi(projectId, input);
  const next = await listTimeEntriesByProject(projectId);
  await mutate(projectTimeEntriesKey(projectId), next, false);
}
