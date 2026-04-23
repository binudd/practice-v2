import type { ReactNode } from 'react';

import { useHasPermission } from '../hooks/use-role';
import { useAuthContext } from '../hooks/use-auth-context';

import type { Permission } from '../permissions';
import type { PolicyFn } from '../hooks/use-policy';

// ----------------------------------------------------------------------

type CommonProps = {
  fallback?: ReactNode;
  children: ReactNode;
};

type PermissionProps = CommonProps & { perm: Permission; policy?: undefined; subject?: undefined };

type PolicyProps = CommonProps & {
  // Kept loose on purpose: the concrete subject shape is enforced by each
  // policy function at its own call sites. Narrowing here would require every
  // <Can> usage to pass an explicit generic parameter.
  policy: PolicyFn<any>;
  subject?: unknown;
  perm?: undefined;
};

export type CanProps = PermissionProps | PolicyProps;

/**
 * Inline access gate with two flavours:
 *   <Can perm="project:create">...</Can>
 *   <Can policy={ProjectPolicy.canEdit} subject={project}>...</Can>
 */
export function Can(props: CanProps) {
  const { perm, policy, subject, fallback = null, children } = props;

  if (perm) {
    return (
      <PermissionGate perm={perm} fallback={fallback}>
        {children}
      </PermissionGate>
    );
  }

  if (policy) {
    return (
      <PolicyGate policy={policy} subject={subject} fallback={fallback}>
        {children}
      </PolicyGate>
    );
  }

  return <>{children}</>;
}

// ----------------------------------------------------------------------

function PermissionGate({
  perm,
  fallback,
  children,
}: {
  perm: Permission;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const allowed = useHasPermission(perm);
  return <>{allowed ? children : fallback}</>;
}

function PolicyGate({
  policy,
  subject,
  fallback,
  children,
}: {
  policy: PolicyFn<any>;
  subject?: unknown;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuthContext();
  const allowed = policy(user, subject);
  return <>{allowed ? children : fallback}</>;
}
