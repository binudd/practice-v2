import Typography from '@mui/material/Typography';

import { formatHoursAsHMM } from '../format-time';

// ----------------------------------------------------------------------

type TimesheetHourCellProps = {
  hours: number;
  align?: 'left' | 'center' | 'right';
  variant?: 'body2' | 'subtitle2';
  bold?: boolean;
};

export function TimesheetHourCell({
  hours,
  align = 'center',
  variant = 'body2',
  bold,
}: TimesheetHourCellProps) {
  return (
    <Typography
      variant={variant}
      align={align}
      sx={{
        fontVariantNumeric: 'tabular-nums',
        color: hours <= 0 ? 'text.disabled' : 'text.primary',
        fontWeight: bold ? 600 : 400,
      }}
    >
      {formatHoursAsHMM(hours)}
    </Typography>
  );
}
