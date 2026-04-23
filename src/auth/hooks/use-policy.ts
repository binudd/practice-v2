import { useAuthContext } from './use-auth-context';

import type { AuthUser } from '../types';

// ----------------------------------------------------------------------

export type PolicyFn<Subject = unknown> = (user: AuthUser, subject?: Subject) => boolean;

/**
 * Evaluate a policy against the current user. Subject is optional so you can
 * use the same hook for class-level checks (`Policy.canCreate(user)`) and
 * instance-level checks (`Policy.canEdit(user, project)`).
 */
export function usePolicy<Subject>(policy: PolicyFn<Subject>, subject?: Subject): boolean {
  const { user } = useAuthContext();
  return policy(user as AuthUser, subject);
}
