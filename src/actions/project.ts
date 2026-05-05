import type { IProject } from 'src/domain/project';

import { useMemo, useEffect } from 'react';
import { useProjectStore } from 'src/store/project-store';

import {
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from 'src/infra/api/project-api';
import {
  isBulkPatchEmpty,
  mergeProjectBulkPatch,
  type ProjectBulkMergeInput,
} from 'src/domain/project/bulk-project-patch';

import { useAuthContext, useCurrentRole } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type UseGetProjectsOptions = {
  /**
   * - 'all'  (default) returns every project.
   * - 'mine' scopes to the current user:
   *     - client        -> projects where clientId === user.id
   *     - other roles   -> projects where user is owner or a member
   */
  scope?: 'all' | 'mine';
  searchText?: string;
};

export function useGetProjects(options: UseGetProjectsOptions = {}) {
  const { scope = 'all', searchText = '' } = options;

  const { user } = useAuthContext();
  const role = useCurrentRole();

  const { projects: storeProjects, isLoading, error, hasFetched, fetchProjects } = useProjectStore();

  useEffect(() => {
    // Only fetch if not fetched yet, or if searchText changed (if we want backend search)
    // The user requested not fetching frequently, but we pass searchText to API
    if (!hasFetched || searchText) {
      fetchProjects(undefined, searchText);
    }
  }, [fetchProjects, hasFetched, searchText]);

  return useMemo(() => {
    const all = storeProjects;

    const projects =
      scope === 'mine' && user?.id
        ? all.filter((p) => {
            if (role === 'client') return p.clientId === user.id;
            return p.ownerId === user.id || p.members.includes(user.id);
          })
        : all;

    return {
      projects,
      projectsLoading: isLoading,
      projectsError: error,
      projectsValidating: isLoading, // matching old return signature
      projectsEmpty: !isLoading && projects.length === 0,
    };
  }, [storeProjects, error, isLoading, role, scope, user?.id]);
}

// ----------------------------------------------------------------------

export function useGetProject(id: string | undefined) {
  const { projects, projectsLoading, projectsError } = useGetProjects();

  return useMemo(() => {
    const project = id ? projects.find((p) => p.id === id) : undefined;
    return {
      project,
      projectLoading: projectsLoading,
      projectError: projectsError,
      projectNotFound: !projectsLoading && !project,
    };
  }, [id, projects, projectsLoading, projectsError]);
}

// ----------------------------------------------------------------------

export async function createProject(input: IProject) {
  const saved = await createProjectApi(input);
  useProjectStore.setState((state) => ({
    projects: [saved, ...state.projects],
  }));
}

export async function updateProject(id: string, patch: Partial<IProject>) {
  await updateProjectApi(id, patch);
  useProjectStore.setState((state) => ({
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}

export type { ProjectBulkMergeInput } from 'src/domain/project/bulk-project-patch';

/**
 * Applies the same bulk merge logic to each target id against `allProjectsSnapshot` (must reflect
 * current cache rows used for editable filtering), persists via API, then runs one SWR `mutate`.
 */
export async function bulkUpdateProjects(
  allProjectsSnapshot: readonly IProject[],
  targetIds: readonly string[],
  input: ProjectBulkMergeInput
): Promise<void> {
  const idSet = new Set(targetIds);

  const updates = targetIds
    .map((id) => {
      const p = allProjectsSnapshot.find((x) => x.id === id);
      if (!p) return null;
      const patch = mergeProjectBulkPatch(p, input);
      return isBulkPatchEmpty(patch) ? null : { id, patch };
    })
    .filter((x): x is { id: string; patch: Partial<IProject> } => !!x);

  if (!updates.length) return;

  await Promise.all(updates.map(({ id, patch }) => updateProjectApi(id, patch)));

  useProjectStore.setState((state) => ({
    projects: state.projects.map((p) => {
      if (!idSet.has(p.id)) return p;
      const patch = mergeProjectBulkPatch(p, input);
      return isBulkPatchEmpty(patch) ? p : { ...p, ...patch };
    }),
  }));
}

export async function deleteProject(id: string) {
  await deleteProjectApi(id);
  useProjectStore.setState((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
  }));
}
