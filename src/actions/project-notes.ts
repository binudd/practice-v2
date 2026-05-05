import type { CreateNoteInput } from 'src/domain/note';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createNoteApi, listNotesByProject } from 'src/infra/api/project-notes-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectNotesKey(projectId: string) {
  return endpoints.projectNotes(projectId);
}

export function useProjectNotes(projectId: string | undefined) {
  const key = projectId ? projectNotesKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listNotesByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      notes: list,
      notesLoading: isLoading,
      notesError: error,
      notesValidating: isValidating,
      notesEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectNote(projectId: string, input: CreateNoteInput) {
  await createNoteApi(projectId, input);
  const next = await listNotesByProject(projectId);
  await mutate(projectNotesKey(projectId), next, false);
}
