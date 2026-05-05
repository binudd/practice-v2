import type { CreateTaskTypeInput } from 'src/domain/task-type';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createTaskTypeApi, listTaskTypesByProject } from 'src/infra/api/project-task-types-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectTaskTypesKey(projectId: string) {
  return endpoints.projectTaskTypes(projectId);
}

export function useProjectTaskTypes(projectId: string | undefined) {
  const key = projectId ? projectTaskTypesKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listTaskTypesByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      taskTypes: list,
      taskTypesLoading: isLoading,
      taskTypesError: error,
      taskTypesValidating: isValidating,
      taskTypesEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectTaskType(projectId: string, input: CreateTaskTypeInput) {
  await createTaskTypeApi(projectId, input);
  const next = await listTaskTypesByProject(projectId);
  await mutate(projectTaskTypesKey(projectId), next, false);
}
