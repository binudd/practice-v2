import type { IAutomationRule, CreateAutomationRuleInput } from 'src/domain/automation';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseAutomationRuleList } from 'src/domain/automation';
import { projectAutomationByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listAutomationsByProject(projectId: string): Promise<IAutomationRule[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectAutomations(projectId));
    return parseAutomationRuleList(res.data);
  }
  const raw = projectAutomationByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createAutomationRuleApi(
  projectId: string,
  input: CreateAutomationRuleInput
): Promise<IAutomationRule> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectAutomations(projectId), input);
    const parsed = parseAutomationRuleList({ rules: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const row: IAutomationRule = {
    id: uuidv4(),
    projectId,
    name: input.name,
    triggerLabel: input.triggerLabel,
    actionLabel: input.actionLabel,
    enabled: input.enabled ?? true,
    createdAt: now,
    updatedAt: now,
  };
  if (!projectAutomationByProjectId[projectId]) {
    projectAutomationByProjectId[projectId] = [];
  }
  projectAutomationByProjectId[projectId].unshift(row);
  return row;
}

export async function setAutomationEnabledApi(
  projectId: string,
  ruleId: string,
  enabled: boolean
): Promise<void> {
  if (USE_SERVER) {
    await axios.patch(`${endpoints.projectAutomations(projectId)}/${ruleId}`, { enabled });
    return;
  }
  const list = projectAutomationByProjectId[projectId];
  const row = list?.find((r) => r.id === ruleId);
  if (row) {
    row.enabled = enabled;
    row.updatedAt = new Date().toISOString();
  }
}
