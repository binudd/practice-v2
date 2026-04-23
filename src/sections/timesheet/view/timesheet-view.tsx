import type { ITimesheetRow } from 'src/types/timesheet';

import dayjs from 'dayjs';
import { useMemo, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';

import { _projects } from 'src/_mock/_project';
import { DashboardContent } from 'src/layouts/dashboard';
import { startOfWeek, CURRENT_USER_ID } from 'src/_mock/_timesheet';
import { upsertEntry, deleteEntry, useGetTimesheet } from 'src/actions/timesheet';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ----------------------------------------------------------------------

export function TimesheetView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);

  const { entries, weekDays, timesheetLoading } = useGetTimesheet(CURRENT_USER_ID, weekStart);

  const rows: ITimesheetRow[] = useMemo(
    () =>
      _projects.map((project) => {
        const hoursByDate: Record<string, number> = {};
        const entryIds: Record<string, string> = {};
        weekDays.forEach((d) => {
          hoursByDate[d] = 0;
          entryIds[d] = '';
        });
        entries
          .filter((e) => e.projectId === project.id)
          .forEach((e) => {
            hoursByDate[e.date] = e.hours;
            entryIds[e.date] = e.id;
          });
        return {
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          hoursByDate,
          entryIds,
        };
      }),
    [entries, weekDays]
  );

  const handleChangeHours = useCallback(
    async (projectId: string, date: string, rawValue: string, existingId: string) => {
      const parsed = parseFloat(rawValue);
      const hours = Number.isFinite(parsed) ? Math.max(0, Math.min(24, parsed)) : 0;

      if (hours === 0 && existingId) {
        try {
          await deleteEntry(existingId);
        } catch (error) {
          console.error(error);
          toast.error('Failed to update');
        }
        return;
      }

      if (hours === 0) return;

      const id = existingId || `ts-${projectId}-${date}`;
      try {
        await upsertEntry({
          id,
          userId: CURRENT_USER_ID,
          projectId,
          date,
          hours,
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to update');
      }
    },
    []
  );

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weekDays.forEach((d) => {
      totals[d] = rows.reduce((sum, row) => sum + (row.hoursByDate[d] ?? 0), 0);
    });
    return totals;
  }, [rows, weekDays]);

  const weekTotal = useMemo(
    () => Object.values(dailyTotals).reduce((sum, n) => sum + n, 0),
    [dailyTotals]
  );

  const shiftWeek = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Timesheet"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Timesheet' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              onClick={() => shiftWeek(-7)}
            >
              Prev
            </Button>
            <Button variant="outlined" onClick={() => setSelectedDate(new Date())}>
              This week
            </Button>
            <Button
              variant="outlined"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              onClick={() => shiftWeek(7)}
            >
              Next
            </Button>
          </Stack>

          <DatePicker
            label="Week containing"
            value={dayjs(selectedDate)}
            onChange={(value) => {
              if (value) setSelectedDate(value.toDate());
            }}
            slotProps={{ textField: { size: 'small', sx: { maxWidth: 220 } } }}
          />

          <Typography variant="subtitle2">
            Week total: <strong>{weekTotal.toFixed(1)}h</strong>
          </Typography>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                {weekDays.map((d, i) => (
                  <TableCell key={d} align="center">
                    <Stack spacing={0}>
                      <Typography variant="caption" color="text.secondary">
                        {DAY_LABELS[i]}
                      </Typography>
                      <Typography variant="caption">{d.slice(5)}</Typography>
                    </Stack>
                  </TableCell>
                ))}
                <TableCell align="right">Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const rowTotal = weekDays.reduce((sum, d) => sum + (row.hoursByDate[d] ?? 0), 0);
                return (
                  <TableRow key={row.projectId} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2">{row.projectName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.projectCode}
                        </Typography>
                      </Stack>
                    </TableCell>
                    {weekDays.map((d) => (
                      <TableCell key={d} align="center" sx={{ width: 80 }}>
                        <TextField
                          type="number"
                          size="small"
                          defaultValue={row.hoursByDate[d] || ''}
                          inputProps={{ min: 0, max: 24, step: 0.25, style: { textAlign: 'center' } }}
                          onBlur={(e) =>
                            handleChangeHours(row.projectId, d, e.target.value, row.entryIds[d])
                          }
                          sx={{ width: 70 }}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Typography variant="subtitle2">{rowTotal.toFixed(1)}h</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          weekDays.forEach((d) => {
                            const id = row.entryIds[d];
                            if (id) deleteEntry(id);
                          });
                        }}
                        aria-label="Clear week"
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2">Daily total</Typography>
                </TableCell>
                {weekDays.map((d) => (
                  <TableCell key={d} align="center">
                    <Typography variant="subtitle2">
                      {(dailyTotals[d] ?? 0).toFixed(1)}h
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Typography variant="subtitle1">{weekTotal.toFixed(1)}h</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {timesheetLoading && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Loading...
          </Typography>
        )}
      </Card>
    </DashboardContent>
  );
}
