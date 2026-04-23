import { isUserRole } from '../roles';
import { hasPermission } from '../permissions';
import { useAuthContext } from './use-auth-context';

import type { UserRole } from '../roles';
import type { Permission } from '../permissions';

// ----------------------------------------------------------------------

export function useCurrentRole(): UserRole | undefined {
  const { user } = useAuthContext();
  return isUserRole(user?.role) ? user?.role : undefined;
}

export function useHasRole(roles: UserRole[] | undefined): boolean {
  const role = useCurrentRole();
  if (!roles || roles.length === 0) return true;
  return !!role && roles.includes(role);
}

export function useHasPermission(perm: Permission): boolean {
  const role = useCurrentRole();
  return hasPermission(role, perm);
}
