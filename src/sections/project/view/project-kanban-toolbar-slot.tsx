import type { ReactNode } from 'react';

import { useMemo, useState, useContext, createContext } from 'react';

// ----------------------------------------------------------------------

type ProjectKanbanToolbarSlotContextValue = {
  toolbarEl: HTMLElement | null;
  setToolbarEl: (el: HTMLElement | null) => void;
};

const ProjectKanbanToolbarSlotContext =
  createContext<ProjectKanbanToolbarSlotContextValue | null>(null);

/** Wraps project detail shell so embedded {@link KanbanView} can port its toolbar beside tabs. */
export function ProjectKanbanToolbarSlotProvider({ children }: { children: ReactNode }) {
  const [toolbarEl, setToolbarElState] = useState<HTMLElement | null>(null);

  const setToolbarEl = useMemo(
    () => (el: HTMLElement | null) => {
      setToolbarElState(el);
    },
    []
  );

  const value = useMemo(
    () => ({ toolbarEl, setToolbarEl }),
    [toolbarEl, setToolbarEl]
  );

  return (
    <ProjectKanbanToolbarSlotContext.Provider value={value}>
      {children}
    </ProjectKanbanToolbarSlotContext.Provider>
  );
}

export function useProjectKanbanToolbarSlot() {
  return useContext(ProjectKanbanToolbarSlotContext);
}
