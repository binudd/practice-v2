import type { IKanbanTask } from 'src/types/kanban';

import { uuidv4 } from 'src/utils/uuidv4';

// ----------------------------------------------------------------------

type BuildNewKanbanTaskInput = {
  status: string;
  reporter: IKanbanTask['reporter'];
};

/** Single place for defaults when creating tasks (toolbar, inline add). */
export function buildNewKanbanTask({ status, reporter }: BuildNewKanbanTaskInput): IKanbanTask {
  return {
    id: uuidv4(),
    status,
    name: 'Untitled',
    priority: 'medium',
    attachments: [],
    labels: [],
    comments: [],
    assignee: [],
    due: [null, null],
    reporter,
  };
}
