import type { IProject } from 'src/types/project';

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

// ----------------------------------------------------------------------

/**
 * End-to-end create flow:
 *   1. insert project into the projects SWR cache
 *   2. seed the default kanban columns for that project
 *   3. surface a success notification
 */
export async function createProjectWithBoard(project: IProject): Promise<Result<{ id: string }>> {
  try {
    await createProjectAction(project);
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
