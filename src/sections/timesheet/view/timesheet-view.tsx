import type { ITimesheetEntry, ITimesheetTaskRowModel } from 'src/types/timesheet';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteEntry, useAllTimesheetEntries } from 'src/actions/timesheet';
import { toIsoDay, startOfWeek, CURRENT_USER_ID } from 'src/_mock/_timesheet';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import {
  breadcrumbHomeLink,
  useSetDashboardBreadcrumbs,
  DashboardToolbarPrimaryButton,
} from 'src/components/dashboard-breadcrumbs';

import { Can } from 'src/auth/guard';
import { useHasPermission } from 'src/auth/hooks/use-role';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { LogTimeDialog } from '../log-time-dialog';
import { TimesheetTable } from '../components/timesheet-table';
import { TimesheetToolbar } from '../components/timesheet-toolbar';
import { useManagerMemberIds } from '../hooks/use-manager-member-ids';

const flexColumn = { flex: '1 1 auto' as const, display: 'flex' as const, flexDirection: 'column' as const };

// ----------------------------------------------------------------------

export function TimesheetView() {
  const { user } = useAuthContext();
  const viewerId = user?.id ?? CURRENT_USER_ID;
  const canViewAll = useHasPermission('timesheet:view-all');

  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedByUser, setExpandedByUser] = useState<Record<string, boolean>>({});

  const [logOpen, setLogOpen] = useState(false);
  const [logContext, setLogContext] = useState<{
    targetUserId: string;
    editing: ITimesheetEntry | null;
    defaultDate?: string;
    defaultProjectId?: string;
    defaultTaskId?: string;
  }>({ targetUserId: viewerId, editing: null });

  const rangeStart = useMemo(() => {
    if (viewMode === 'week') {
      return startOfWeek(selectedDate);
    }
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [viewMode, selectedDate]);

  const dayCount = viewMode === 'week' ? 7 : 1;

  const weekDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 0; i < dayCount; i += 1) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      days.push(toIsoDay(d));
    }
    return days;
  }, [rangeStart, dayCount]);

  const todayIso = toIsoDay(new Date());

  const { allEntries, allEntriesLoading } = useAllTimesheetEntries();

  const isManagerView = canViewAll;

  const entriesInRange = useMemo(
    () =>
      allEntries.filter((e) => {
        if (!weekDays.includes(e.date)) return false;
        if (!isManagerView) return e.userId === viewerId;
        return true;
      }),
    [allEntries, weekDays, isManagerView, viewerId]
  );

  const memberIds = useManagerMemberIds(entriesInRange, isManagerView);

  const addTargetUserId = useMemo(() => {
    if (!isManagerView) return viewerId;
    if (memberIds.includes(viewerId)) return viewerId;
    return memberIds[0] ?? viewerId;
  }, [isManagerView, viewerId, memberIds]);

  const grandTotalsByDay = useMemo(() => {
    const m: Record<string, number> = {};
    weekDays.forEach((d) => {
      m[d] = entriesInRange.filter((e) => e.date === d).reduce((s, e) => s + e.hours, 0);
    });
    return m;
  }, [entriesInRange, weekDays]);

  const grandWeekTotal = useMemo(
    () => Object.values(grandTotalsByDay).reduce((a, b) => a + b, 0),
    [grandTotalsByDay]
  );

  const historyEntries = useMemo(
    () => allEntries.filter((e) => e.userId === logContext.targetUserId),
    [allEntries, logContext.targetUserId]
  );

  const shiftRange = (dir: -1 | 1) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + dir * (viewMode === 'week' ? 7 : 1));
    setSelectedDate(next);
  };

  const canEditForUser = useCallback(
    (userId: string) => canViewAll || userId === viewerId,
    [canViewAll, viewerId]
  );

  const openAdd = useCallback(() => {
    setLogContext({
      targetUserId: addTargetUserId,
      editing: null,
      defaultDate: weekDays[0],
    });
    setLogOpen(true);
  }, [addTargetUserId, weekDays]);

  const openTaskCell = useCallback(
    (targetUserId: string, row: ITimesheetTaskRowModel, date: string) => {
      if (!canEditForUser(targetUserId)) return;
      const existing = entriesInRange.find(
        (e) =>
          e.userId === targetUserId &&
          e.projectId === row.projectId &&
          (e.taskId ?? '') === (row.taskId ?? '') &&
          e.date === date
      );
      setLogContext({
        targetUserId,
        editing: existing ?? null,
        defaultDate: date,
        defaultProjectId: row.projectId,
        defaultTaskId: row.taskId,
      });
      setLogOpen(true);
    },
    [canEditForUser, entriesInRange]
  );

  const handleClearTaskRow = useCallback(
    async (row: ITimesheetTaskRowModel) => {
      if (!canEditForUser(row.userId)) return;
      try {
        await Promise.all(
          weekDays.map((d) => {
            const id = row.entryIds[d];
            return id ? deleteEntry(id) : Promise.resolve();
          })
        );
        toast.success('Row cleared');
      } catch (e) {
        console.error(e);
        toast.error('Failed to clear row');
      }
    },
    [canEditForUser, weekDays]
  );

  const onToggleMember = useCallback((userId: string) => {
    setExpandedByUser((prev) => {
      const isOpen = prev[userId] !== false;
      return { ...prev, [userId]: !isOpen };
    });
  }, []);

  useSetDashboardBreadcrumbs(
    [breadcrumbHomeLink, { name: 'Timesheet' }],
    <Can perm="timesheet:enter">
      <DashboardToolbarPrimaryButton
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={openAdd}
        disabled={allEntriesLoading}
      >
        Add time log
      </DashboardToolbarPrimaryButton>
    </Can>,
    [openAdd, allEntriesLoading]
  );

  return (
    <DashboardContent sx={{ ...flexColumn }}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 0,
          alignSelf: 'stretch',
          width: 1,
          overflow: 'hidden',
          p: 0,
        }}
      >
        <TimesheetToolbar
          viewMode={viewMode}
          onViewMode={setViewMode}
          selectedDate={selectedDate}
          onSelectedDate={setSelectedDate}
          weekDays={weekDays}
          onPrev={() => shiftRange(-1)}
          onNext={() => shiftRange(1)}
          onToday={() => setSelectedDate(new Date())}
          loading={allEntriesLoading}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', width: 1 }}>
          <TimesheetTable
            mode={isManagerView ? 'manager' : 'member'}
            viewerId={viewerId}
            weekDays={weekDays}
            todayIso={todayIso}
            entriesInRange={entriesInRange}
            memberIds={memberIds}
            expandedByUser={expandedByUser}
            onToggleMember={onToggleMember}
            grandTotalsByDay={grandTotalsByDay}
            grandWeekTotal={grandWeekTotal}
            canEditForUser={canEditForUser}
            onTaskCellClick={openTaskCell}
            onClearTaskRow={handleClearTaskRow}
          />

          {allEntriesLoading && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, flexShrink: 0 }}>
              Loading…
            </Typography>
          )}
        </Box>
      </Card>

      <LogTimeDialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        targetUserId={logContext.targetUserId}
        historyEntries={historyEntries}
        weekDays={weekDays}
        defaultDate={logContext.defaultDate}
        defaultProjectId={logContext.defaultProjectId}
        defaultTaskId={logContext.defaultTaskId}
        editingEntry={logContext.editing ?? undefined}
      />
    </DashboardContent>
  );
}
