import type { ReactNode } from 'react';
import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export type PrimaryTodayButtonProps = Omit<ButtonProps, 'variant' | 'color' | 'size'> & {
  children?: ReactNode;
};

/** Red contained “Today” style shared with Calendar toolbar. */
export function PrimaryTodayButton({ children = 'Today', ...other }: PrimaryTodayButtonProps) {
  return (
    <Button size="small" color="error" variant="contained" {...other}>
      {children}
    </Button>
  );
}
