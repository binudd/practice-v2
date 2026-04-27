import type { CreateAutomationRuleInput } from 'src/domain/automation';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import {
  createAutomationRuleApi,
  setAutomationEnabledApi,
  listAutomationsByProject,
} from 'src/infra/api/project-automations-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectAutomationsKey(projectId: string) {
  return endpoints.projectAutomations(projectId);
}

export function useProjectAutomations(projectId: string | undefined) {
  const key = projectId ? projectAutomationsKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listAutomationsByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      automations: list,
      automationsLoading: isLoading,
      automationsError: error,
      automationsValidating: isValidating,
      automationsEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectAutomation(projectId: string, input: CreateAutomationRuleInput) {
  await createAutomationRuleApi(projectId, input);
  const next = await listAutomationsByProject(projectId);
  await mutate(projectAutomationsKey(projectId), next, false);
}

export async function setProjectAutomationEnabled(
  projectId: string,
  ruleId: string,
  enabled: boolean
) {
  await setAutomationEnabledApi(projectId, ruleId, enabled);
  const next = await listAutomationsByProject(projectId);
  await mutate(projectAutomationsKey(projectId), next, false);
}
