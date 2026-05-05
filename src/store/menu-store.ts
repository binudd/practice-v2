import { create } from 'zustand';
import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export type Menu = {
  menuID: number;
  menuName: string;
  isReport: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canView?: boolean;
  canDelete?: boolean;
};

export type Role = {
  roleID: number;
  roleName: string;
  roleDescription: string;
  isValid: boolean;
};

export type MenuState = {
  menus: Menu[];
  roles: Role[];
  loading: boolean;
  roleLoading: boolean;
  error: string | null;
  fetchMenus: (tenantID: number) => Promise<void>;
  fetchRoles: (tenantID: number) => Promise<void>;
  fetchRoleDetails: (roleID: number) => Promise<any>;
  savePermissions: (payload: any) => Promise<void>;
  deleteRole: (roleID: number, payload: any) => Promise<void>;
};

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  roles: [],
  loading: false,
  roleLoading: false,
  error: null,
  fetchMenus: async (tenantID: number) => {
    set({ loading: true, error: null });
    try {
      // The API might expect tenantID as a query parameter
      const response = await axios.get(endpoints.permissionSettings.menuList, {
        params: { TenantID: tenantID },
      });
      set({ menus: response.data, loading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch menus', loading: false });
    }
  },
  fetchRoles: async (tenantID: number) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(endpoints.permissionSettings.roleList, {
        params: { TenantID: tenantID },
      });
      set({ roles: response.data, loading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch roles', loading: false });
    }
  },
  fetchRoleDetails: async (roleID: number) => {
    set({ roleLoading: true, error: null });
    try {
      const response = await axios.get(endpoints.permissionSettings.getRole, {
        params: { RoleID: roleID },
      });
      set({ roleLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch role details', roleLoading: false });
      throw error;
    }
  },
  savePermissions: async (payload: any) => {
    set({ roleLoading: true, error: null });
    try {
      await axios.post(endpoints.permissionSettings.saveRole, payload);
      set({ roleLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to save permissions', roleLoading: false });
      throw error;
    }
  },
  deleteRole: async (roleID: number, payload: any) => {
    set({ roleLoading: true, error: null });
    try {
      await axios.delete(endpoints.permissionSettings.deleteRole, {
        params: { RoleID: roleID },
        data: payload,
      });
      set({ roleLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to delete role', roleLoading: false });
      throw error;
    }
  },
}));
