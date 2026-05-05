import type { MouseEvent as ReactMouseEvent } from 'react';
import type { KanbanBoardLayoutMode } from 'src/store/ui-preferences-store';

import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useUIPreferencesStore } from 'src/store/ui-preferences-store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  /** Same as Kanban browse scope (`projectId` or `'global'`). */
  scopeKey: string;
};

export function KanbanBoardLayoutToggle({ scopeKey }: Props) {
  const layoutMode = useUIPreferencesStore((s) => s.kanbanLayout[scopeKey] ?? 'board');
  const setKanbanLayout = useUIPreferencesStore((s) => s.setKanbanLayout);

  const handleChange = (
    _event: ReactMouseEvent<HTMLElement>,
    mode: KanbanBoardLayoutMode | null
  ) => {
    if (mode !== null) {
      setKanbanLayout(scopeKey, mode);
    }
  };

  return (
    <ToggleButtonGroup size="small" exclusive value={layoutMode} onChange={handleChange}>
      <ToggleButton value="board" aria-label="Board columns">
        <Tooltip title="Board">
          <Iconify icon="mingcute:dot-grid-fill" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="list" aria-label="Task list">
        <Tooltip title="List">
          <Iconify icon="solar:list-bold" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
