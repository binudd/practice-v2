import type { ITimeEntry, CreateTimeEntryInput } from 'src/domain/time-entry';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseTimeEntryList } from 'src/domain/time-entry';
import { projectTimeEntriesByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listTimeEntriesByProject(projectId: string): Promise<ITimeEntry[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectTimeEntries(projectId));
    return parseTimeEntryList(res.data);
  }
  const raw = projectTimeEntriesByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createTimeEntryApi(
  projectId: string,
  input: CreateTimeEntryInput
): Promise<ITimeEntry> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectTimeEntries(projectId), input);
    const parsed = parseTimeEntryList({ entries: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const row: ITimeEntry = {
    id: uuidv4(),
    projectId,
    description: input.description,
    hours: input.hours,
    loggedAt: input.loggedAt,
    userLabel: input.userLabel,
    createdAt: now,
  };
  if (!projectTimeEntriesByProjectId[projectId]) {
    projectTimeEntriesByProjectId[projectId] = [];
  }
  projectTimeEntriesByProjectId[projectId].unshift(row);
  return row;
}
