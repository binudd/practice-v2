import type { IKanbanAssignee } from 'src/types/kanban';

import { _contacts } from 'src/_mock';

// ----------------------------------------------------------------------

export const KANBAN_CONTACT_ASSIGN_OPTIONS = _contacts.map((c) => ({
  value: String(c.id),
  label: c.name,
}));

/** Map mock contact rows to Kanban assignee shape for cache updates */
export function kanbanAssigneeFromContactId(contactId: string): IKanbanAssignee | null {
  const c = _contacts.find((x) => String(x.id) === contactId);
  if (!c) return null;
  return {
    id: String(c.id),
    name: c.name,
    role: c.role,
    email: c.email,
    status: c.status ?? 'offline',
    address: c.address ?? '',
    avatarUrl: c.avatarUrl,
    phoneNumber: c.phoneNumber,
    lastActivity: c.lastActivity,
  };
}
