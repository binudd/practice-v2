import type { AuthUser } from 'src/auth/types';
import type { IKanbanTask } from 'src/types/kanban';

import { hasPermission } from 'src/auth/permissions';

// ----------------------------------------------------------------------

export const TaskPolicy = {
  canView: (user: AuthUser) => !!user && hasPermission(user.role, 'task:view'),

  canUpdate: (user: AuthUser, task: IKanbanTask) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'task:update')) return false;
    if (user.role === 'member') {
      // Members can update tasks they are assigned to, or unassigned tasks in
      // their projects (the project policy handles project membership).
      const assigneeIds = task.assignee?.map((a) => a.id) ?? [];
      return assigneeIds.length === 0 || assigneeIds.includes(user.id);
    }
    return true;
  },

  canAssign: (user: AuthUser) => !!user && hasPermission(user.role, 'task:assign'),
};
