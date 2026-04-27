import type { ITimesheetEntry } from 'src/types/timesheet';

import { formatHoursAsHMM } from './format-time';

// ----------------------------------------------------------------------

export type HourSuggestion = {
  hours: number;
  projectId?: string;
  taskId?: string;
  label: string;
};

export function getRecentHourSuggestions(
  entries: ITimesheetEntry[],
  options: { limit?: number } = {}
): HourSuggestion[] {
  const limit = options.limit ?? 6;
  const sorted = [...entries]
    .filter((e) => e.hours > 0)
    .sort((a, b) => (a.date === b.date ? 0 : b.date.localeCompare(a.date)));

  const seen = new Set<string>();

  return sorted.reduce<HourSuggestion[]>((out, e) => {
    if (out.length >= limit) {
      return out;
    }
    const key = `${e.hours}|${e.projectId}|${e.taskId ?? ''}`;
    if (seen.has(key)) {
      return out;
    }
    seen.add(key);
    out.push({
      hours: e.hours,
      projectId: e.projectId,
      taskId: e.taskId,
      label: e.taskName
        ? `${formatHoursAsHMM(e.hours)} · ${e.taskName}`
        : formatHoursAsHMM(e.hours),
    });
    return out;
  }, []);
}
