import type { IDateValue } from 'src/types/common';
import type { IKanbanTask, IKanbanAssignee } from 'src/types/kanban';

// ----------------------------------------------------------------------

/** Optional window slice; unspecified sides keep each task's existing dates */
export type KanbanBulkDueParts = {
  startISO?: IDateValue;
  endISO?: IDateValue;
};

export type KanbanBulkMergeInput = {
  priority?: string;
  due?: KanbanBulkDueParts;
  assigneesToAdd?: IKanbanAssignee[];
};

export function mergeAssigneesById(existing: IKanbanAssignee[], toAdd: IKanbanAssignee[]) {
  const seen = new Set(existing.map((a) => String(a.id)));
  const next = [...existing];

  toAdd.forEach((a) => {
    const id = String(a.id);
    if (!seen.has(id)) {
      seen.add(id);
      next.push(a);
    }
  });

  return next;
}

/** Apply enabled bulk fields onto a task (assignees merged by id). */
export function mergeKanbanTaskBulkPatch(task: IKanbanTask, input: KanbanBulkMergeInput): IKanbanTask {
  let next: IKanbanTask = { ...task };
  if (input.priority !== undefined) {
    next = { ...next, priority: input.priority };
  }
  if (input.due && (input.due.startISO !== undefined || input.due.endISO !== undefined)) {
    const start = input.due.startISO !== undefined ? input.due.startISO : task.due[0];
    const end = input.due.endISO !== undefined ? input.due.endISO : task.due[1];
    next = { ...next, due: [start, end] };
  }
  if (input.assigneesToAdd?.length) {
    next = { ...next, assignee: mergeAssigneesById(task.assignee, input.assigneesToAdd) };
  }
  return next;
}

export function isKanbanBulkMergeEmpty(input: KanbanBulkMergeInput): boolean {
  const touchesDue =
    Boolean(input.due) &&
    (input.due!.startISO !== undefined || input.due!.endISO !== undefined);

  return (
    input.priority === undefined &&
    !touchesDue &&
    !input.assigneesToAdd?.length
  );
}
