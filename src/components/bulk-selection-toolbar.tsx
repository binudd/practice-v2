import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type BulkSelectionToolbarProps = {
  selectedCount: number;
  /** Shown when `selectedCount` is zero */
  emptySelectionHelperText?: string;
  /** Appended after the primary line when set (caller formats, e.g. “3 skipped”) */
  secondaryNote?: string;
  sx?: SxProps<Theme>;
  actions?: ReactNode;
};

/** Slim row used above DataGrids for bulk-update flows */
export function BulkSelectionToolbar({
  selectedCount,
  emptySelectionHelperText = 'Select rows for bulk updates',
  secondaryNote,
  actions,
  sx,
}: BulkSelectionToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={1.5}
      sx={{ mb: 2, ...sx }}
    >
      <Typography variant="body2" color="text.secondary">
        {selectedCount > 0 ? `${selectedCount} selected` : emptySelectionHelperText}
        {secondaryNote ? ` · ${secondaryNote}` : ''}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      {actions}
    </Stack>
  );
}
