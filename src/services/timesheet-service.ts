import type { ITimesheetEntry } from 'src/types/timesheet';

import { buildTimesheetEntryId } from 'src/utils/timesheet-entry-id';

import { toIsoDay } from 'src/_mock/_timesheet';
import { notify } from 'src/store/notifications-store';
import { upsertEntry as upsertEntryAction } from 'src/actions/timesheet';

import { ok, err, toMessage, type Result } from './result';

// ----------------------------------------------------------------------

const MAX_DAILY_HOURS = 24;

export type WeekDraftEntry = {
  projectId: string;
  date: string;
  hours: number;
  note?: string;
  taskId?: string;
  taskName?: string;
};

// ----------------------------------------------------------------------

/**
 * Submit a whole week for the given user. Validates totals before writing so
 * callers get one error summary rather than seven individual upsert failures.
 */
export async function submitWeek(
  userId: string,
  draft: WeekDraftEntry[]
): Promise<Result<{ entries: ITimesheetEntry[] }>> {
  const invalid = draft.find((d) => d.hours < 0 || d.hours > MAX_DAILY_HOURS);
  if (invalid) {
    const message = `Hours must be between 0 and ${MAX_DAILY_HOURS} (got ${invalid.hours})`;
    notify({ kind: 'warning', title: 'Invalid timesheet', description: message });
    return err(message);
  }

  try {
    const toWrite: ITimesheetEntry[] = draft
      .filter((row) => row.hours > 0)
      .map((row) => {
        const iso = toIsoDay(new Date(row.date));
        return {
          id: buildTimesheetEntryId(userId, row.projectId, iso, row.taskId),
          userId,
          projectId: row.projectId,
          date: iso,
          hours: row.hours,
          note: row.note,
          taskId: row.taskId,
          taskName: row.taskName,
        };
      });

    await Promise.all(toWrite.map((e) => upsertEntryAction(e)));

    notify({
      kind: 'success',
      title: 'Timesheet submitted',
      description: `${toWrite.length} entries saved`,
    });
    return ok({ entries: toWrite });
  } catch (e) {
    const message = toMessage(e);
    notify({ kind: 'error', title: 'Timesheet save failed', description: message });
    return err(message);
  }
}
