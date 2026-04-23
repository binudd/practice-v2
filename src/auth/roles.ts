export type UserRole = 'superadmin' | 'admin' | 'manager' | 'member' | 'client';

export const ROLES: Record<
  UserRole,
  {
    label: string;
    color: 'default' | 'info' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
  }
> = {
  superadmin: { label: 'Super admin', color: 'error' },
  admin: { label: 'Admin', color: 'warning' },
  manager: { label: 'Manager', color: 'info' },
  member: { label: 'Member', color: 'success' },
  client: { label: 'Client', color: 'default' },
};

export const ROLE_OPTIONS = (Object.keys(ROLES) as UserRole[]).map((v) => ({
  value: v,
  label: ROLES[v].label,
}));

export const ALL_ROLES: UserRole[] = Object.keys(ROLES) as UserRole[];

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && value in ROLES;
