import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { useDevStore } from 'src/store/dev-store';
import { useUserStore } from 'src/store';

import { isUserRole } from 'src/auth/roles';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

/**
 * NOTE: the dev-only role override previously lived in sessionStorage. It now
 * lives in `src/store/dev-store.ts` which persists to sessionStorage via the
 * zustand persist middleware. We subscribe to that store so role changes take
 * effect without a page reload.
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  const roleOverride = useDevStore((s) => s.roleOverride);

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const storedUser = useUserStore.getState().user;

        if (storedUser) {
          setState({ user: { ...storedUser, accessToken }, loading: false });
        } else {
          // If for some reason we have a token but no user data in store, 
          // we could either call /me or just logout.
          // Since we want to avoid /me if it doesn't exist:
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(() => {
    const baseRole = isUserRole(state.user?.role) ? state.user?.role : CONFIG.auth.defaultRole;
    const resolvedRole = import.meta.env.DEV && roleOverride ? roleOverride : baseRole;

    return {
      user: state.user
        ? {
            ...state.user,
            role: resolvedRole,
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    };
  }, [checkUserSession, roleOverride, state.user, status]);

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
