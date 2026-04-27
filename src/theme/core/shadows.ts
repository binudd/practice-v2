import type { Shadows } from '@mui/material/styles';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

/**
 * MUI `elevation` maps to `theme.shadows[n]`. Neutral surfaces use background
 * tokens instead of drop shadows for separation from the dashboard canvas.
 */
export function shadows(_colorScheme: ThemeColorScheme): Shadows {
  return Array.from({ length: 25 }, () => 'none') as Shadows;
}
