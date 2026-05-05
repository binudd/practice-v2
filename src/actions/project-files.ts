import type { CreateProjectFileInput } from 'src/domain/project-file';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createProjectFileApi, listProjectFilesByProject } from 'src/infra/api/project-files-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectFilesKey(projectId: string) {
  return endpoints.projectFiles(projectId);
}

export function useProjectFiles(projectId: string | undefined) {
  const key = projectId ? projectFilesKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listProjectFilesByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      files: list,
      filesLoading: isLoading,
      filesError: error,
      filesValidating: isValidating,
      filesEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectFileRecord(projectId: string, input: CreateProjectFileInput) {
  await createProjectFileApi(projectId, input);
  const next = await listProjectFilesByProject(projectId);
  await mutate(projectFilesKey(projectId), next, false);
}
