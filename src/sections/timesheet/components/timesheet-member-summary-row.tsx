import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { _userList } from 'src/_mock/_user';

import { Iconify } from 'src/components/iconify';

import { TimesheetHourCell } from './timesheet-hour-cell';

// ----------------------------------------------------------------------

function initials(name: string) {
  const p = name.split(' ').filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
}

type TimesheetMemberSummaryRowProps = {
  userId: string;
  weekDays: string[];
  todayIso: string;
  hoursByDate: Record<string, number>;
  expanded: boolean;
  onToggle: () => void;
};

export function TimesheetMemberSummaryRow({
  userId,
  weekDays,
  todayIso,
  hoursByDate,
  expanded,
  onToggle,
}: TimesheetMemberSummaryRowProps) {
  const user = _userList.find((u) => u.id === userId);
  const name = user?.name ?? userId;
  const rowTotal = weekDays.reduce((s, d) => s + (hoursByDate[d] ?? 0), 0);

  return (
    <TableRow
      hover
      sx={{
        cursor: 'pointer',
        '& > *': { borderBottom: (theme) => `1px dashed ${theme.vars.palette.divider}` },
      }}
      onClick={onToggle}
    >
      <TableCell sx={{ py: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <Iconify
              width={18}
              icon={expanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          </IconButton>
          <Avatar alt={name} src={user?.avatarUrl} sx={{ width: 32, height: 32, fontSize: 14 }}>
            {initials(name)}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>
            {name}
          </Typography>
        </Stack>
      </TableCell>
      {weekDays.map((d) => (
        <TableCell
          key={d}
          align="center"
          sx={{
            py: 1.25,
            ...(d === todayIso && { bgcolor: (theme) => `${theme.palette.info.main}14` }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TimesheetHourCell hours={hoursByDate[d] ?? 0} />
        </TableCell>
      ))}
      <TableCell align="right" sx={{ py: 1.25 }} onClick={(e) => e.stopPropagation()}>
        <TimesheetHourCell hours={rowTotal} variant="subtitle2" bold align="right" />
      </TableCell>
      <TableCell sx={{ width: 48 }} onClick={(e) => e.stopPropagation()} />
    </TableRow>
  );
}
