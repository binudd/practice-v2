import type { CreateExpenseInput } from 'src/domain/expense';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { createExpenseApi, listExpensesByProject } from 'src/infra/api/project-expenses-api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function projectExpensesKey(projectId: string) {
  return endpoints.projectExpenses(projectId);
}

export function useProjectExpenses(projectId: string | undefined) {
  const key = projectId ? projectExpensesKey(projectId) : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    () => listExpensesByProject(projectId!),
    swrOptions
  );

  return useMemo(() => {
    const list = data ?? [];
    return {
      expenses: list,
      expensesLoading: isLoading,
      expensesError: error,
      expensesValidating: isValidating,
      expensesEmpty: !isLoading && list.length === 0,
    };
  }, [data, error, isLoading, isValidating]);
}

export async function createProjectExpense(projectId: string, input: CreateExpenseInput) {
  await createExpenseApi(projectId, input);
  const next = await listExpensesByProject(projectId);
  await mutate(projectExpensesKey(projectId), next, false);
}
