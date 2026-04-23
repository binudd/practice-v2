import type { Theme, SxProps } from '@mui/material/styles';

import { useCurrentRole } from '../hooks';
import { RoleBasedGuard } from './role-based-guard';

import type { UserRole } from '../roles';

// ----------------------------------------------------------------------

export type RoleGuardProps = {
  sx?: SxProps<Theme>;
  roles: UserRole[];
  hasContent?: boolean;
  children: React.ReactNode;
};

/**
 * Context-aware wrapper around RoleBasedGuard. Reads the current user's role
 * from AuthContext so callers only specify the accepted roles.
 */
export function RoleGuard({ roles, hasContent = true, sx, children }: RoleGuardProps) {
  const currentRole = useCurrentRole();

  return (
    <RoleBasedGuard
      sx={sx}
      hasContent={hasContent}
      acceptRoles={roles}
      currentRole={currentRole ?? ''}
    >
      {children}
    </RoleBasedGuard>
  );
}
