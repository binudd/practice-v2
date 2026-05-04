import type { AuthUser } from 'src/auth/types';
import type { IKanbanTask } from 'src/types/kanban';

import { _mock } from 'src/_mock';

// ----------------------------------------------------------------------

/** Maps signed-in user to kanban reporter; falls back to mock data when unavailable. */
export function reporterFromAuthUser(authUser?: AuthUser | null): IKanbanTask['reporter'] {
  const u = authUser;
  if (u?.id) {
    return {
      id: u.id,
      name: u.displayName?.trim() || u.email || 'User',
      avatarUrl: u.photoURL ?? '',
    };
  }
  return {
    id: String(_mock.id(16)),
    name: _mock.fullName(16),
    avatarUrl: _mock.image.avatar(16),
  };
}
