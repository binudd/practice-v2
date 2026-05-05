import type { IProjectStatus } from 'src/domain/project';

import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';

// ----------------------------------------------------------------------

/** Human-readable labels for project status chips and tables — derived from `PROJECT_STATUS_OPTIONS`. */
export const PROJECT_STATUS_LABELS = PROJECT_STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<IProjectStatus, string>
);

/** Soft `Label` color mapping used across project list and overview. */
export const PROJECT_STATUS_SOFT_COLOR: Record<
  IProjectStatus,
  'success' | 'warning' | 'info' | 'default'
> = {
  active: 'success',
  'on-hold': 'warning',
  completed: 'info',
  archived: 'default',
};
