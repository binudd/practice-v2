import type { IProject } from 'src/domain/project';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import {
  listProjects,
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
// Actions = SWR surface. All transport concerns live in `src/infra/api/*`.
// When the backend is ready, flip USE_SERVER in project-api.ts - no changes
// here are required.

const PROJECT_ENDPOINT = endpoints.project;

const swrFetcher = async (): Promise<{ projects: IProject[] }> => ({
  projects: await listProjects(),
});

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ProjectsData = {
  projects: IProject[];
};

type UseGetProjectsOptions = {
  /**
   * - 'all'  (default) returns every project.
   * - 'mine' scopes to the current user:
   *     - client        -> projects where clientId === user.id
   *     - other roles   -> projects where user is owner or a member
   */
  scope?: 'all' | 'mine';
};

export function useGetProjects(options: UseGetProjectsOptions = {}) {
  const { scope = 'all' } = options;

  const { user } = useAuthContext();
  const role = useCurrentRole();

  const { data, isLoading, error, isValidating } = useSWR<ProjectsData>(
    PROJECT_ENDPOINT,
    swrFetcher,
    swrOptions
  );

  return useMemo(() => {
    const all = data?.projects ?? [];

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
      projectsValidating: isValidating,
      projectsEmpty: !isLoading && projects.length === 0,
    };
  }, [data?.projects, error, isLoading, isValidating, role, scope, user?.id]);
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
  await mutate(
    PROJECT_ENDPOINT,
    (current) => {
      const data = (current as ProjectsData) ?? { projects: [] };
      return { projects: [saved, ...data.projects] };
    },
    false
  );
}

export async function updateProject(id: string, patch: Partial<IProject>) {
  await updateProjectApi(id, patch);
  await mutate(
    PROJECT_ENDPOINT,
    (current) => {
      const data = (current as ProjectsData) ?? { projects: [] };
      return {
        projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    },
    false
  );
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

  await mutate(
    PROJECT_ENDPOINT,
    (current) => {
      const data = ((current as ProjectsData) ?? { projects: [] }).projects;
      return {
        projects: data.map((p) => {
          if (!idSet.has(p.id)) return p;
          const patch = mergeProjectBulkPatch(p, input);
          return isBulkPatchEmpty(patch) ? p : { ...p, ...patch };
        }),
      };
    },
    false
  );
}

export async function deleteProject(id: string) {
  await deleteProjectApi(id);
  await mutate(
    PROJECT_ENDPOINT,
    (current) => {
      const data = (current as ProjectsData) ?? { projects: [] };
      return { projects: data.projects.filter((p) => p.id !== id) };
    },
    false
  );
}
