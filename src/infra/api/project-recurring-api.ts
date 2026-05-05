import type { IRecurringRule, CreateRecurringRuleInput } from 'src/domain/recurring';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseRecurringRuleList } from 'src/domain/recurring';
import { projectRecurringByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listRecurringByProject(projectId: string): Promise<IRecurringRule[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectRecurring(projectId));
    return parseRecurringRuleList(res.data);
  }
  const raw = projectRecurringByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createRecurringRuleApi(
  projectId: string,
  input: CreateRecurringRuleInput
): Promise<IRecurringRule> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectRecurring(projectId), input);
    const parsed = parseRecurringRuleList({ rules: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const row: IRecurringRule = {
    id: uuidv4(),
    projectId,
    title: input.title,
    cadence: input.cadence,
    nextRunAt: input.nextRunAt,
    enabled: input.enabled ?? true,
    createdAt: now,
    updatedAt: now,
  };
  if (!projectRecurringByProjectId[projectId]) {
    projectRecurringByProjectId[projectId] = [];
  }
  projectRecurringByProjectId[projectId].unshift(row);
  return row;
}
