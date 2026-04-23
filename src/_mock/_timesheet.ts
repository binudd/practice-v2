import type { ITimesheetEntry } from 'src/types/timesheet';

import { _mock } from './_mock';
import { _projects } from './_project';

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

// Seed a handful of entries for the current week so the user sees data on first load.
const CURRENT_USER_ID = _mock.id(1);
const weekStart = startOfWeek(new Date());

export const _timesheetEntries: ITimesheetEntry[] = [];

[0, 1, 2, 3, 4].forEach((dayOffset) => {
  const day = new Date(weekStart);
  day.setDate(day.getDate() + dayOffset);
  const iso = toIsoDay(day);

  _timesheetEntries.push({
    id: `ts-${_projects[0].id}-${iso}`,
    userId: CURRENT_USER_ID,
    projectId: _projects[0].id,
    date: iso,
    hours: 4 + (dayOffset % 3),
  });
  _timesheetEntries.push({
    id: `ts-${_projects[1].id}-${iso}`,
    userId: CURRENT_USER_ID,
    projectId: _projects[1].id,
    date: iso,
    hours: 2 + (dayOffset % 2),
  });
});

export { CURRENT_USER_ID, startOfWeek, toIsoDay }; // eslint-disable-line perfectionist/sort-named-exports
