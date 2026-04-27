import type { ITimesheetEntry } from 'src/types/timesheet';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { toIsoDay, _timesheetEntries } from 'src/_mock/_timesheet';

// ----------------------------------------------------------------------

const TIMESHEET_ENDPOINT = endpoints.timesheet;

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

type TimesheetData = {
  entries: ITimesheetEntry[];
};

const localFetcher = async (): Promise<TimesheetData> => ({ entries: _timesheetEntries });

// ----------------------------------------------------------------------

export function useAllTimesheetEntries() {
  const { data, isLoading, error, isValidating } = useSWR<TimesheetData>(
    TIMESHEET_ENDPOINT,
    localFetcher,
    swrOptions
  );

  return {
    allEntries: data?.entries ?? [],
    allEntriesLoading: isLoading,
    allEntriesError: error,
    allEntriesValidating: isValidating,
  };
}

// ----------------------------------------------------------------------

export function useGetTimesheet(userId: string, rangeStart: Date, dayCount: number = 7) {
  const { data, isLoading, error, isValidating } = useSWR<TimesheetData>(
    TIMESHEET_ENDPOINT,
    localFetcher,
    swrOptions
  );

  return useMemo(() => {
    const all = data?.entries ?? [];

    const weekDays: string[] = [];
    for (let i = 0; i < dayCount; i += 1) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      weekDays.push(toIsoDay(d));
    }

    const entries = all.filter((e) => e.userId === userId && weekDays.includes(e.date));

    return {
      entries,
      weekDays,
      timesheetLoading: isLoading,
      timesheetError: error,
      timesheetValidating: isValidating,
    };
  }, [data?.entries, userId, rangeStart, dayCount, isLoading, error, isValidating]);
}

// ----------------------------------------------------------------------

export async function upsertEntry(entry: ITimesheetEntry) {
  await mutate(
    TIMESHEET_ENDPOINT,
    (current) => {
      const data = (current as TimesheetData) ?? { entries: [] };
      const existing = data.entries.find((e) => e.id === entry.id);
      const entries = existing
        ? data.entries.map((e) => (e.id === entry.id ? entry : e))
        : [...data.entries, entry];
      return { entries };
    },
    false
  );
}

export async function deleteEntry(entryId: string) {
  await mutate(
    TIMESHEET_ENDPOINT,
    (current) => {
      const data = (current as TimesheetData) ?? { entries: [] };
      return { entries: data.entries.filter((e) => e.id !== entryId) };
    },
    false
  );
}
