import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export type DashboardToolbarPrimaryButtonProps = Omit<ButtonProps, 'variant'>;

/**
 * Default primary CTA for `useSetDashboardBreadcrumbs` (global header `rightAreaStart`).
 * Forces `variant="contained"` and baseline layout so actions match list modules (invoice, projects, etc.).
 */
export function DashboardToolbarPrimaryButton({ sx, ...props }: DashboardToolbarPrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      sx={[{ flexShrink: 0, whiteSpace: 'nowrap' }, ...(sx !== undefined ? (Array.isArray(sx) ? sx : [sx]) : [])]}
      {...props}
    />
  );
}
