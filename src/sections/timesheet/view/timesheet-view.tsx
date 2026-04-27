import type { ITimesheetEntry, ITimesheetTaskRowModel } from 'src/types/timesheet';

import { useMemo, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteEntry, useAllTimesheetEntries } from 'src/actions/timesheet';
import { toIsoDay, startOfWeek, CURRENT_USER_ID } from 'src/_mock/_timesheet';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useHasPermission } from 'src/auth/hooks/use-role';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import { LogTimeDrawer } from '../log-time-drawer';
import { TimesheetTable } from '../components/timesheet-table';
import { TimesheetToolbar } from '../components/timesheet-toolbar';
import { useManagerMemberIds } from '../hooks/use-manager-member-ids';

// ----------------------------------------------------------------------

export function TimesheetView() {
  const { user } = useAuthContext();
  const viewerId = user?.id ?? CURRENT_USER_ID;
  const canViewAll = useHasPermission('timesheet:view-all');
  const canLogTime = useHasPermission('timesheet:enter');

  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedByUser, setExpandedByUser] = useState<Record<string, boolean>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<{
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
    () => allEntries.filter((e) => e.userId === drawerContext.targetUserId),
    [allEntries, drawerContext.targetUserId]
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
    setDrawerContext({
      targetUserId: addTargetUserId,
      editing: null,
      defaultDate: weekDays[0],
    });
    setDrawerOpen(true);
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
      setDrawerContext({
        targetUserId,
        editing: existing ?? null,
        defaultDate: date,
        defaultProjectId: row.projectId,
        defaultTaskId: row.taskId,
      });
      setDrawerOpen(true);
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

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Timesheet' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <TimesheetToolbar
            viewMode={viewMode}
            onViewMode={setViewMode}
            selectedDate={selectedDate}
            onSelectedDate={setSelectedDate}
            weekDays={weekDays}
            onPrev={() => shiftRange(-1)}
            onNext={() => shiftRange(1)}
            onToday={() => setSelectedDate(new Date())}
            onAddTimeLog={openAdd}
            canAdd={canLogTime}
            loading={allEntriesLoading}
          />

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
            <Typography variant="caption" color="text.secondary">
              Loading…
            </Typography>
          )}
        </Stack>
      </Card>

      <LogTimeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        targetUserId={drawerContext.targetUserId}
        historyEntries={historyEntries}
        weekDays={weekDays}
        defaultDate={drawerContext.defaultDate}
        defaultProjectId={drawerContext.defaultProjectId}
        defaultTaskId={drawerContext.defaultTaskId}
        editingEntry={drawerContext.editing ?? undefined}
      />
    </DashboardContent>
  );
}
