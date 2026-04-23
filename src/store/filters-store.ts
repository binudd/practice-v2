import { createStore } from './create';

// ----------------------------------------------------------------------

export type FilterBag = {
  search?: string;
  status?: string;
  dateRange?: [string | null, string | null];
  [key: string]: unknown;
};

export type FiltersState = {
  byScreen: Record<string, FilterBag>;
  setFilter: (screen: string, patch: FilterBag) => void;
  replaceFilter: (screen: string, value: FilterBag) => void;
  resetFilter: (screen: string) => void;
  resetAll: () => void;
};

// ----------------------------------------------------------------------

const EMPTY: FilterBag = {};

export const useFiltersStore = createStore<FiltersState>('filters', (set) => ({
  byScreen: {},

  setFilter: (screen, patch) =>
    set(
      (state) => ({
        byScreen: {
          ...state.byScreen,
          [screen]: { ...(state.byScreen[screen] ?? EMPTY), ...patch },
        },
      }),
      false,
      `setFilter(${screen})`
    ),

  replaceFilter: (screen, value) =>
    set(
      (state) => ({ byScreen: { ...state.byScreen, [screen]: value } }),
      false,
      `replaceFilter(${screen})`
    ),

  resetFilter: (screen) =>
    set(
      (state) => {
        const next = { ...state.byScreen };
        delete next[screen];
        return { byScreen: next };
      },
      false,
      `resetFilter(${screen})`
    ),

  resetAll: () => set({ byScreen: {} }, false, 'resetAll'),
}));

// ----------------------------------------------------------------------

/** Typed selector helper for one screen's filter bag. */
export const selectScreenFilter = (screen: string) => (state: FiltersState) =>
  state.byScreen[screen] ?? EMPTY;
