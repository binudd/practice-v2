import type { ITimesheetEntry } from 'src/types/timesheet';

import { formatHoursAsHMM } from './format-time';

// ----------------------------------------------------------------------

export type HourSuggestion = {
  hours: number;
  /** Same as quick-pick labels (e.g. "1:30"). */
  label: string;
};

/**
 * Recent distinct hour values from entries (newest first) for fast typing — hours only, no task/project.
 */
export function getRecentHourSuggestions(
  entries: ITimesheetEntry[],
  options: { limit?: number } = {}
): HourSuggestion[] {
  const limit = options.limit ?? 6;
  const sorted = [...entries]
    .filter((e) => e.hours > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const seen = new Set<number>();

  return sorted.reduce<HourSuggestion[]>((out, e) => {
    if (out.length >= limit) {
      return out;
    }
    if (seen.has(e.hours)) {
      return out;
    }
    seen.add(e.hours);
    out.push({
      hours: e.hours,
      label: formatHoursAsHMM(e.hours),
    });
    return out;
  }, []);
}
