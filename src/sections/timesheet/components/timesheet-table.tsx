import type { ITimesheetEntry, ITimesheetTaskRowModel } from 'src/types/timesheet';

import dayjs from 'dayjs';
import { useMemo, Fragment } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { TimesheetTaskRow } from './timesheet-task-row';
import { TimesheetGrandTotalRow } from './timesheet-grand-total-row';
import { buildTaskRowsForUser } from '../hooks/use-timesheet-task-rows';
import { TimesheetMemberSummaryRow } from './timesheet-member-summary-row';

// ----------------------------------------------------------------------

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function isoWeekdayIndex(iso: string): number {
  const x = new Date(`${iso}T12:00:00`);
  return (x.getDay() + 6) % 7;
}

function sumTaskRowsForDay(rows: ITimesheetTaskRowModel[], date: string): number {
  return rows.reduce((s, r) => s + (r.hoursByDate[date] ?? 0), 0);
}

function buildMemberDayTotals(rows: ITimesheetTaskRowModel[], weekDays: string[]) {
  const m: Record<string, number> = {};
  weekDays.forEach((d) => {
    m[d] = sumTaskRowsForDay(rows, d);
  });
  return m;
}

// ----------------------------------------------------------------------

export type TimesheetTableProps = {
  mode: 'manager' | 'member';
  viewerId: string;
  weekDays: string[];
  todayIso: string;
  entriesInRange: ITimesheetEntry[];
  memberIds: string[];
  expandedByUser: Record<string, boolean>;
  onToggleMember: (userId: string) => void;
  grandTotalsByDay: Record<string, number>;
  grandWeekTotal: number;
  canEditForUser: (userId: string) => boolean;
  onTaskCellClick: (userId: string, row: ITimesheetTaskRowModel, date: string) => void;
  onClearTaskRow: (row: ITimesheetTaskRowModel) => void;
};

export function TimesheetTable({
  mode,
  viewerId,
  weekDays,
  todayIso,
  entriesInRange,
  memberIds,
  expandedByUser,
  onToggleMember,
  grandTotalsByDay,
  grandWeekTotal,
  canEditForUser,
  onTaskCellClick,
  onClearTaskRow,
}: TimesheetTableProps) {
  const groups = useMemo(() => {
    if (mode === 'member') {
      const rows = buildTaskRowsForUser(viewerId, entriesInRange, weekDays);
      return [{ userId: viewerId, rows }];
    }
    return memberIds
      .map((userId) => ({
        userId,
        rows: buildTaskRowsForUser(userId, entriesInRange, weekDays),
      }))
      .filter((g) => g.rows.length > 0);
  }, [mode, viewerId, memberIds, entriesInRange, weekDays]);

  const firstColLabel = mode === 'manager' ? 'Members' : 'Project / task';

  const hasAnyRows = groups.some((g) => g.rows.length > 0);

  return (
    <TableContainer
      component={Box}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        overflow: 'auto',
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: 220, fontWeight: 700 }}>{firstColLabel}</TableCell>
            {weekDays.map((d, i) => {
              const labelIdx = weekDays.length === 7 ? i : isoWeekdayIndex(d);
              return (
                <TableCell
                  key={d}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    ...(d === todayIso && { bgcolor: (theme) => `${theme.palette.info.main}1F` }),
                  }}
                >
                  <Typography variant="caption" display="block" color="text.secondary">
                    {DAY_LABELS[labelIdx]}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {dayjs(d).format('D MMM')}
                  </Typography>
                </TableCell>
              );
            })}
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Total
            </TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          <TimesheetGrandTotalRow
            weekDays={weekDays}
            todayIso={todayIso}
            dailyTotals={grandTotalsByDay}
            weekTotal={grandWeekTotal}
            firstColumnLabel="Grand total"
          />

          {!hasAnyRows && (
            <TableRow>
              <TableCell colSpan={weekDays.length + 3}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No time logged in this period.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {mode === 'member' &&
            groups[0]?.rows.map((row) => (
              <TimesheetTaskRow
                key={row.rowKey}
                row={row}
                weekDays={weekDays}
                todayIso={todayIso}
                indent={false}
                canEdit={canEditForUser(viewerId)}
                onCellClick={(date) => onTaskCellClick(viewerId, row, date)}
                onClearRow={() => onClearTaskRow(row)}
              />
            ))}

          {mode === 'manager' &&
            groups.map((g) => {
              const memberTotals = buildMemberDayTotals(g.rows, weekDays);
              const expanded = expandedByUser[g.userId] !== false;
              return (
                <Fragment key={g.userId}>
                  <TimesheetMemberSummaryRow
                    userId={g.userId}
                    weekDays={weekDays}
                    todayIso={todayIso}
                    hoursByDate={memberTotals}
                    expanded={expanded}
                    onToggle={() => onToggleMember(g.userId)}
                  />
                  {expanded &&
                    g.rows.map((row) => (
                      <TimesheetTaskRow
                        key={row.rowKey}
                        row={row}
                        weekDays={weekDays}
                        todayIso={todayIso}
                        canEdit={canEditForUser(g.userId)}
                        onCellClick={(date) => onTaskCellClick(g.userId, row, date)}
                        onClearRow={() => onClearTaskRow(row)}
                      />
                    ))}
                </Fragment>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
