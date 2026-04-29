import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

export type DateToolbarRowProps = {
  loading?: boolean;
  children: ReactNode;
};

/**
 * Shared chrome for calendar / timesheet date toolbars: horizontal band with optional top loading line.
 * Children are typically three clusters (e.g. view controls | prev/title/next | today + extras).
 */
export function DateToolbarRow({ loading = false, children }: DateToolbarRowProps) {
  return (
    <Box sx={{ position: 'relative', p: 2.5, pr: { xs: 2.5, md: 2 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
      >
        {children}
      </Stack>

      {loading && (
        <LinearProgress
          color="inherit"
          sx={{
            left: 0,
            width: 1,
            height: 2,
            bottom: 0,
            borderRadius: 0,
            position: 'absolute',
          }}
        />
      )}
    </Box>
  );
}
