import type { UserRole } from 'src/auth/roles';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/**
 * Returns the landing path for a freshly signed-in user. Kept role-aware here
 * so the sign-in view, password-reset flow and any future SSO callback share
 * the same redirect rules.
 */
export function redirectPathFor(role: UserRole | undefined): string {
  switch (role) {
    case 'client':
      // Clients get routed to their invoices-heavy dashboard; /dashboard also
      // renders their role-specific view, so this stays symmetrical.
      return paths.dashboard.root;
    case 'superadmin':
    case 'admin':
    case 'manager':
    case 'member':
    default:
      return paths.dashboard.root;
  }
}

/**
 * Hook-friendly wrapper so view components can write:
 *   router.push(signInAndRedirect(user.role))
 * without knowing the path table.
 */
export function signInAndRedirect(role: UserRole | undefined) {
  return redirectPathFor(role);
}
