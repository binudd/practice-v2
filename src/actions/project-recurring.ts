import type { CreateRecurringRuleInput } from 'src/domain/recurring';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createRecurringRuleApi, listRecurringByProject } from 'src/infra/api/project-recurring-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectRecurringKey(projectId: string) {
  return endpoints.projectRecurring(projectId);
}

export function useProjectRecurring(projectId: string | undefined) {
  const key = projectId ? projectRecurringKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listRecurringByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      recurringRules: list,
      recurringLoading: isLoading,
      recurringError: error,
      recurringValidating: isValidating,
      recurringEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectRecurringRule(
  projectId: string,
  input: CreateRecurringRuleInput
) {
  await createRecurringRuleApi(projectId, input);
  const next = await listRecurringByProject(projectId);
  await mutate(projectRecurringKey(projectId), next, false);
}
