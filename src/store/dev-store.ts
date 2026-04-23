import type { UserRole } from 'src/auth/roles';

import { createPersistedStore } from './create';

// ----------------------------------------------------------------------

export type DevState = {
  /** Forces AuthContext to resolve to this role regardless of backend response. */
  roleOverride?: UserRole;
  setRoleOverride: (role?: UserRole) => void;
  clearRoleOverride: () => void;
};

// Session-scoped so opening a new tab starts fresh.
export const useDevStore = createPersistedStore<DevState>(
  'dev',
  (set) => ({
    roleOverride: undefined,

    setRoleOverride: (role) => set({ roleOverride: role }, false, 'setRoleOverride'),
    clearRoleOverride: () => set({ roleOverride: undefined }, false, 'clearRoleOverride'),
  }),
  {
    name: 'dev',
    storage: 'session',
    version: 1,
    partialize: (s) => ({ roleOverride: s.roleOverride }),
  }
);
