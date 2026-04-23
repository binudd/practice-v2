import type { AuthUser } from 'src/auth/types';
import type { IProject } from 'src/types/project';

import { hasPermission } from 'src/auth/permissions';

// ----------------------------------------------------------------------

const isPrivileged = (u: AuthUser) => u?.role === 'admin' || u?.role === 'superadmin';

export const ProjectPolicy = {
  canView: (user: AuthUser, p?: IProject) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'project:view')) return false;
    if (user.role !== 'client') return true;
    return !!p && p.clientId === user.id;
  },

  canEdit: (user: AuthUser, p: IProject) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'project:update')) return false;
    return isPrivileged(user) || p.ownerId === user.id;
  },

  canDelete: (user: AuthUser, p: IProject) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'project:delete')) return false;
    return isPrivileged(user) || p.ownerId === user.id;
  },

  canAssign: (user: AuthUser, p: IProject) => ProjectPolicy.canEdit(user, p),

  canManageBoard: (user: AuthUser, p: IProject) =>
    user?.role === 'client' ? false : ProjectPolicy.canEdit(user, p),
};
