import type { ITimesheetTaskRowModel } from 'src/types/timesheet';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { TimesheetHourCell } from './timesheet-hour-cell';

// ----------------------------------------------------------------------

type TimesheetTaskRowProps = {
  row: ITimesheetTaskRowModel;
  weekDays: string[];
  todayIso: string;
  indent?: boolean;
  canEdit: boolean;
  onCellClick: (date: string) => void;
  onClearRow: () => void;
};

export function TimesheetTaskRow({
  row,
  weekDays,
  todayIso,
  indent = true,
  canEdit,
  onCellClick,
  onClearRow,
}: TimesheetTaskRowProps) {
  const rowTotal = weekDays.reduce((s, d) => s + (row.hoursByDate[d] ?? 0), 0);
  const label = row.taskName || row.projectName;
  const sub = row.taskName ? row.projectCode : '';

  return (
    <TableRow
      hover
      sx={{
        '& > *': { borderBottom: (theme) => `1px dashed ${theme.vars.palette.divider}` },
      }}
    >
      <TableCell sx={{ py: 1, pl: indent ? 5 : 2 }}>
        <Stack>
          <Typography variant="body2" fontWeight={500}>
            {label}
          </Typography>
          {!!sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Stack>
      </TableCell>
      {weekDays.map((d) => {
        const h = row.hoursByDate[d] ?? 0;
        return (
          <TableCell
            key={d}
            align="center"
            sx={{
              py: 1,
              cursor: canEdit ? 'pointer' : 'default',
              ...(d === todayIso && { bgcolor: (theme) => `${theme.palette.info.main}14` }),
            }}
            onClick={() => canEdit && onCellClick(d)}
          >
            <TimesheetHourCell hours={h} />
          </TableCell>
        );
      })}
      <TableCell align="right" sx={{ py: 1 }}>
        <TimesheetHourCell hours={rowTotal} variant="subtitle2" align="right" />
      </TableCell>
      <TableCell align="right" sx={{ py: 1, width: 48 }}>
        {canEdit && (
          <IconButton size="small" onClick={onClearRow} aria-label="Clear row">
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}
