// ----------------------------------------------------------------------

export type MenuPermissionListItem = {
  menuID: number;
  menuName: string;
  isReport: boolean;
};

export type RoleItem = {
  roleID: number;
  roleName: string;
  roleDescription: string;
  isValid: boolean;
};

export type MenuCrudPermissions = {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type MenuPermissionMatrixState = Record<number, MenuCrudPermissions>;

export const emptyMenuCrudPermissions = (): MenuCrudPermissions => ({
  canView: false,
  canAdd: false,
  canEdit: false,
  canDelete: false,
});

// ----------------------------------------------------------------------

/** User row used when assigning a named role + menu permissions */
export type PermissionAssignee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
};

export type PermissionAssignmentPayload = {
  roleID: number;
  roleName: string;
  roleDescription: string;
  matrix: MenuPermissionMatrixState;
};
