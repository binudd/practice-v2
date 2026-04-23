import type { AuthUser } from 'src/auth/types';
import type { IUserItem } from 'src/types/user';

import { hasPermission } from 'src/auth/permissions';

// ----------------------------------------------------------------------

export const UserPolicy = {
  canViewList: (user: AuthUser) => !!user && hasPermission(user.role, 'user:view'),

  canManage: (user: AuthUser, target?: IUserItem) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'user:manage')) return false;
    // Prevent non-superadmin from editing a superadmin account.
    if (target?.role === 'superadmin' && user.role !== 'superadmin') return false;
    return true;
  },

  canManageRoles: (user: AuthUser, target?: IUserItem) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'user:manage-roles')) return false;
    if (target?.role === 'superadmin' && user.role !== 'superadmin') return false;
    return true;
  },
};
