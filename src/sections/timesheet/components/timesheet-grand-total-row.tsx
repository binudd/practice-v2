import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { TimesheetHourCell } from './timesheet-hour-cell';

// ----------------------------------------------------------------------

type TimesheetGrandTotalRowProps = {
  weekDays: string[];
  todayIso: string;
  dailyTotals: Record<string, number>;
  weekTotal: number;
  firstColumnLabel: string;
};

export function TimesheetGrandTotalRow({
  weekDays,
  todayIso,
  dailyTotals,
  weekTotal,
  firstColumnLabel,
}: TimesheetGrandTotalRowProps) {
  return (
    <TableRow sx={{ bgcolor: 'background.subtle' }}>
      <TableCell sx={{ py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {firstColumnLabel}
        </Typography>
      </TableCell>
      {weekDays.map((d) => (
        <TableCell
          key={d}
          align="center"
          sx={{
            py: 1.5,
            ...(d === todayIso && { bgcolor: (theme) => `${theme.palette.info.main}14` }),
          }}
        >
          <TimesheetHourCell hours={dailyTotals[d] ?? 0} variant="subtitle2" bold />
        </TableCell>
      ))}
      <TableCell align="right" sx={{ py: 1.5 }}>
        <TimesheetHourCell hours={weekTotal} variant="subtitle2" bold align="right" />
      </TableCell>
      <TableCell sx={{ width: 48 }} />
    </TableRow>
  );
}
