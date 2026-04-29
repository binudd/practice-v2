import type { ReactNode } from 'react';
import type { TypographyProps } from '@mui/material/Typography';

import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type DateNavTitleProps = {
  children: ReactNode;
} & TypographyProps;

/** Center title for date toolbars; matches Calendar toolbar `variant="h6"`. */
export function DateNavTitle({ children, sx, variant = 'h6', ...other }: DateNavTitleProps) {
  return (
    <Typography variant={variant} sx={sx} {...other}>
      {children}
    </Typography>
  );
}
