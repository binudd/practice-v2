import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DateNavArrowBack({ 'aria-label': ariaLabel = 'Previous', ...other }: IconButtonProps) {
  return (
    <IconButton size="small" aria-label={ariaLabel} {...other}>
      <Iconify icon="eva:arrow-ios-back-fill" />
    </IconButton>
  );
}

export function DateNavArrowForward({
  'aria-label': ariaLabel = 'Next',
  ...other
}: IconButtonProps) {
  return (
    <IconButton size="small" aria-label={ariaLabel} {...other}>
      <Iconify icon="eva:arrow-ios-forward-fill" />
    </IconButton>
  );
}
