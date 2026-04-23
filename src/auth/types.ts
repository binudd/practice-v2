import type { UserRole } from './roles';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  tenantId?: string;
  accessToken?: string;
  [key: string]: any;
} | null;

// Kept for backwards compatibility with existing guards/hooks that referenced UserType.
export type UserType = AuthUser;

export type AuthState = {
  user: AuthUser;
  loading: boolean;
};

export type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
