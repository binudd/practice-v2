import type { IProject } from 'src/types/project';

import { _mock } from 'src/_mock/_mock';
import { notify } from 'src/store/notifications-store';
import { createColumn, deleteColumn } from 'src/actions/kanban';
import {
  deleteProject as deleteProjectAction,
  updateProject as updateProjectAction,
  createProject as createProjectAction,
} from 'src/actions/project';

import { ok, err, toMessage, type Result } from './result';

// ----------------------------------------------------------------------

const DEFAULT_COLUMNS = ['Backlog', 'To do', 'In progress', 'Done'];

export type NewProjectInput = Partial<IProject> & {
  name: string;
  code: string;
  status: IProject['status'];
  ownerId: string;
  ownerName: string;
};

// ----------------------------------------------------------------------

/**
 * End-to-end create flow:
 *   1. insert project into the projects SWR cache
 *   2. seed the default kanban columns for that project
 *   3. surface a success notification
 *
 * Components should call this instead of chaining the raw actions so the flow
 * is transactional from the user's perspective.
 */
export async function createProjectWithBoard(
  input: NewProjectInput
): Promise<Result<{ id: string }>> {
  const project: IProject = {
    id: _mock.id(Math.floor(Math.random() * 19) + 1),
    members: [],
    startDate: new Date().toISOString(),
    progress: 0,
    totalTasks: 0,
    completedTasks: 0,
    description: '',
    priority: 'medium',
    isFavorite: false,
    ...input,
  };

  try {
    await createProjectAction(project);
    // Seed board - the local kanban store ignores projectId, but we persist the
    // intent so the real backend can use it later.
    await Promise.all(
      DEFAULT_COLUMNS.map((name) =>
        createColumn({ id: `${project.id}-${name.toLowerCase().replace(/\s+/g, '-')}`, name })
      )
    );
    notify({ kind: 'success', title: 'Project created', description: project.name });
    return ok({ id: project.id });
  } catch (e) {
    const message = toMessage(e);
    notify({ kind: 'error', title: 'Failed to create project', description: message });
    return err(message);
  }
}

// ----------------------------------------------------------------------

export async function archiveProject(project: IProject): Promise<Result<void>> {
  try {
    await updateProjectAction(project.id, { status: 'archived' });
    notify({ kind: 'info', title: 'Project archived', description: project.name });
    return ok(undefined);
  } catch (e) {
    const message = toMessage(e);
    notify({ kind: 'error', title: 'Failed to archive project', description: message });
    return err(message);
  }
}

export async function deleteProjectCascade(project: IProject): Promise<Result<void>> {
  try {
    await deleteProjectAction(project.id);
    // Tombstone the kanban columns that belonged to this project. Best-effort:
    // any failure is logged and swallowed so the project deletion still wins.
    await Promise.all(
      DEFAULT_COLUMNS.map(async (col) => {
        const columnId = `${project.id}-${col.toLowerCase().replace(/\s+/g, '-')}`;
        try {
          await deleteColumn(columnId);
        } catch (e) {
          console.warn('[project-service] column tombstone failed', columnId, e);
        }
      })
    );
    notify({ kind: 'info', title: 'Project deleted', description: project.name });
    return ok(undefined);
  } catch (e) {
    const message = toMessage(e);
    notify({ kind: 'error', title: 'Failed to delete project', description: message });
    return err(message);
  }
}
