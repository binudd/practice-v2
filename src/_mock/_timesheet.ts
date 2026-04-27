import type { ITimesheetEntry } from 'src/types/timesheet';

import { buildTimesheetEntryId } from 'src/utils/timesheet-entry-id';

import { _mock } from './_mock';
import { _roleUsers } from './_user';
import { _projects } from './_project';
import { getTasksForProject } from './_timesheet-tasks';

// ----------------------------------------------------------------------

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const CURRENT_USER_ID = _mock.id(1);
const weekStart = startOfWeek(new Date());

export const _timesheetEntries: ITimesheetEntry[] = [];

const tasksP0 = getTasksForProject(_projects[0].id);
const tasksP1 = getTasksForProject(_projects[1].id);
const tasksP2 = getTasksForProject(_projects[2].id);

[0, 1, 2, 3, 4].forEach((dayOffset) => {
  const day = new Date(weekStart);
  day.setDate(day.getDate() + dayOffset);
  const iso = toIsoDay(day);

  _timesheetEntries.push({
    id: buildTimesheetEntryId(CURRENT_USER_ID, _projects[0].id, iso, tasksP0[1]?.id),
    userId: CURRENT_USER_ID,
    projectId: _projects[0].id,
    taskId: tasksP0[1]?.id,
    taskName: tasksP0[1]?.name,
    date: iso,
    hours: 4 + (dayOffset % 3),
    note: dayOffset === 0 ? 'Team sync' : undefined,
  });
  _timesheetEntries.push({
    id: buildTimesheetEntryId(CURRENT_USER_ID, _projects[1].id, iso, tasksP1[0]?.id),
    userId: CURRENT_USER_ID,
    projectId: _projects[1].id,
    taskId: tasksP1[0]?.id,
    taskName: tasksP1[0]?.name,
    date: iso,
    hours: 2 + (dayOffset % 2),
  });
});

const midWeek = new Date(weekStart);
midWeek.setDate(midWeek.getDate() + 2);
const midIso = toIsoDay(midWeek);
_timesheetEntries.push({
  id: buildTimesheetEntryId(CURRENT_USER_ID, _projects[0].id, midIso, tasksP0[2]?.id),
  userId: CURRENT_USER_ID,
  projectId: _projects[0].id,
  taskId: tasksP0[2]?.id,
  taskName: tasksP0[2]?.name,
  date: midIso,
  hours: 3,
});

const managerId = _roleUsers.manager.id;
_timesheetEntries.push({
  id: buildTimesheetEntryId(managerId, _projects[2].id, midIso, tasksP2[0]?.id),
  userId: managerId,
  projectId: _projects[2].id,
  taskId: tasksP2[0]?.id,
  taskName: tasksP2[0]?.name,
  date: midIso,
  hours: 5.5,
  note: 'Planning',
});

export { CURRENT_USER_ID, startOfWeek, toIsoDay }; // eslint-disable-line perfectionist/sort-named-exports
