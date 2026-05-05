import type { BreadcrumbsLinkProps } from 'src/components/custom-breadcrumbs/types';

import {
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
  useLayoutEffect,
} from 'react';

// ----------------------------------------------------------------------

export type DashboardBreadcrumbState = {
  links: BreadcrumbsLinkProps[];
  action?: React.ReactNode;
};

type DashboardBreadcrumbsContextValue = {
  state: DashboardBreadcrumbState;
  setTrail: (next: DashboardBreadcrumbState) => void;
  clearTrail: () => void;
};

const defaultState: DashboardBreadcrumbState = {
  links: [],
  action: undefined,
};

const DashboardBreadcrumbsContext = createContext<DashboardBreadcrumbsContextValue | null>(null);

export function DashboardBreadcrumbsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DashboardBreadcrumbState>(defaultState);

  const setTrail = useCallback((next: DashboardBreadcrumbState) => {
    setState(next);
  }, []);

  const clearTrail = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setTrail,
      clearTrail,
    }),
    [state, setTrail, clearTrail]
  );

  return (
    <DashboardBreadcrumbsContext.Provider value={value}>
      {children}
    </DashboardBreadcrumbsContext.Provider>
  );
}

export function useDashboardBreadcrumbsContext() {
  const ctx = useContext(DashboardBreadcrumbsContext);
  if (!ctx) {
    throw new Error('Dashboard breadcrumbs context is only available inside DashboardLayout.');
  }
  return ctx;
}

type SetBreadcrumbOptions = {
  /** When true, do not publish or clear (e.g. embedded Kanban under project detail). */
  skip?: boolean;
};

/**
 * Publishes toolbar breadcrumbs for the current page. Clears on unmount or when deps change.
 * Pass all values used to build `links` in `deps`.
 */
export function useSetDashboardBreadcrumbs(
  links: BreadcrumbsLinkProps[],
  action: React.ReactNode | undefined,
  deps: React.DependencyList,
  options?: SetBreadcrumbOptions
): void {
  const { setTrail, clearTrail } = useDashboardBreadcrumbsContext();
  const skip = options?.skip;

  useLayoutEffect(() => {
    if (skip) {
      return undefined;
    }
    setTrail({ links, action });
    return () => {
      clearTrail();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies deps; skip appended
  }, [...deps, skip]);
}
