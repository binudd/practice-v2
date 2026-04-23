import type { UserRole } from './roles';

// ----------------------------------------------------------------------

export type Permission =
  | 'project:view'
  | 'project:create'
  | 'project:update'
  | 'project:delete'
  | 'task:view'
  | 'task:update'
  | 'task:assign'
  | 'timesheet:enter'
  | 'timesheet:view-all'
  | 'user:view'
  | 'user:manage'
  | 'user:manage-roles'
  | 'invoice:view'
  | 'invoice:manage'
  | 'tenant:manage'
  | 'billing:view'
  | 'files:view'
  | 'files:manage'
  | 'chat:use'
  | 'mail:use';

// ----------------------------------------------------------------------

const ALL_PERMISSIONS: Permission[] = [
  'project:view',
  'project:create',
  'project:update',
  'project:delete',
  'task:view',
  'task:update',
  'task:assign',
  'timesheet:enter',
  'timesheet:view-all',
  'user:view',
  'user:manage',
  'user:manage-roles',
  'invoice:view',
  'invoice:manage',
  'tenant:manage',
  'billing:view',
  'files:view',
  'files:manage',
  'chat:use',
  'mail:use',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: [
    'project:view',
    'project:create',
    'project:update',
    'project:delete',
    'task:view',
    'task:update',
    'task:assign',
    'timesheet:enter',
    'timesheet:view-all',
    'user:view',
    'user:manage',
    'user:manage-roles',
    'invoice:view',
    'invoice:manage',
    'billing:view',
    'files:view',
    'files:manage',
    'chat:use',
    'mail:use',
  ],
  manager: [
    'project:view',
    'project:create',
    'project:update',
    'task:view',
    'task:update',
    'task:assign',
    'timesheet:enter',
    'timesheet:view-all',
    'user:view',
    'invoice:view',
    'files:view',
    'files:manage',
    'chat:use',
    'mail:use',
  ],
  member: [
    'project:view',
    'task:view',
    'task:update',
    'timesheet:enter',
    'files:view',
    'chat:use',
    'mail:use',
  ],
  client: ['project:view', 'invoice:view', 'files:view'],
};

// ----------------------------------------------------------------------

export const hasPermission = (role: UserRole | undefined, perm: Permission): boolean =>
  !!role && ROLE_PERMISSIONS[role].includes(perm);

export const hasAnyPermission = (
  role: UserRole | undefined,
  perms: Permission[]
): boolean => !!role && perms.some((p) => ROLE_PERMISSIONS[role].includes(p));

export const hasAllPermissions = (
  role: UserRole | undefined,
  perms: Permission[]
): boolean => !!role && perms.every((p) => ROLE_PERMISSIONS[role].includes(p));
