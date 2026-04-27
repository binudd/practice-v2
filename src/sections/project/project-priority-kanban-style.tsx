import type { IProjectPriority } from 'src/types/project';
import type { Theme, SxProps } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Matches kanban task priority visuals (`KanbanDetailsPriority` / `ItemBase`). */
const PRIORITY_ICON: Record<IProjectPriority, string> = {
  low: 'solar:double-alt-arrow-down-bold-duotone',
  medium: 'solar:double-alt-arrow-right-bold-duotone',
  high: 'solar:double-alt-arrow-up-bold-duotone',
};

type IconProps = {
  priority: IProjectPriority;
  sx?: SxProps<Theme>;
};

export function ProjectPriorityKanbanIcon({ priority, sx }: IconProps) {
  return (
    <Iconify
      icon={PRIORITY_ICON[priority]}
      sx={{
        ...(priority === 'low' && { color: 'info.main' }),
        ...(priority === 'medium' && { color: 'warning.main' }),
        ...(priority === 'high' && { color: 'error.main' }),
        ...sx,
      }}
    />
  );
}

export const PROJECT_PRIORITY_OPTIONS: IProjectPriority[] = ['low', 'medium', 'high'];
