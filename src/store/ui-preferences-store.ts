import { createPersistedStore } from './create';

// ----------------------------------------------------------------------

export type ViewMode = 'list' | 'grid';

export type KanbanBoardLayoutMode = 'board' | 'list';

const RECENT_MAX = 8;

export type UIPreferencesState = {
  /** Per-screen view mode, keyed by a stable screen id (e.g. 'project.list'). */
  viewMode: Record<string, ViewMode>;
  /** Kanban browse layout per scope (`projectId` or `global`). */
  kanbanLayout: Record<string, KanbanBoardLayoutMode>;

  /** Whether the sidebar is collapsed to mini. */
  sidebarMini: boolean;
  /** LRU-ish list of recently opened project ids. Newest first, capped at {@link RECENT_MAX}. */
  recentProjectIds: string[];

  setViewMode: (screen: string, mode: ViewMode) => void;
  setKanbanLayout: (scopeKey: string, mode: KanbanBoardLayoutMode) => void;

  toggleSidebar: () => void;
  setSidebarMini: (value: boolean) => void;
  pushRecentProject: (id: string) => void;
  clearRecentProjects: () => void;
};

// ----------------------------------------------------------------------

export const useUIPreferencesStore = createPersistedStore<UIPreferencesState>(
  'ui-preferences',
  (set) => ({
    viewMode: {},
    kanbanLayout: {},
    sidebarMini: false,
    recentProjectIds: [],

    setViewMode: (screen, mode) =>
      set(
        (state) => ({ viewMode: { ...state.viewMode, [screen]: mode } }),
        false,
        `setViewMode(${screen}, ${mode})`
      ),

    setKanbanLayout: (scopeKey, mode) =>
      set(
        (state) => ({ kanbanLayout: { ...state.kanbanLayout, [scopeKey]: mode } }),
        false,
        `setKanbanLayout(${scopeKey}, ${mode})`
      ),

    toggleSidebar: () =>
      set((state) => ({ sidebarMini: !state.sidebarMini }), false, 'toggleSidebar'),

    setSidebarMini: (value) => set({ sidebarMini: value }, false, 'setSidebarMini'),

    pushRecentProject: (id) =>
      set(
        (state) => {
          const next = [id, ...state.recentProjectIds.filter((x) => x !== id)].slice(0, RECENT_MAX);
          return { recentProjectIds: next };
        },
        false,
        'pushRecentProject'
      ),

    clearRecentProjects: () => set({ recentProjectIds: [] }, false, 'clearRecentProjects'),
  }),
  {
    name: 'ui-prefs',
    version: 2,
    partialize: (s) => ({
      viewMode: s.viewMode,
      kanbanLayout: s.kanbanLayout,
      sidebarMini: s.sidebarMini,
      recentProjectIds: s.recentProjectIds,
    }),
  }
);
