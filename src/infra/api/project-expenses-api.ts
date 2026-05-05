import type { IExpense, CreateExpenseInput } from 'src/domain/expense';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseExpenseList } from 'src/domain/expense';
import { projectExpensesByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listExpensesByProject(projectId: string): Promise<IExpense[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectExpenses(projectId));
    return parseExpenseList(res.data);
  }
  const raw = projectExpensesByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createExpenseApi(
  projectId: string,
  input: CreateExpenseInput
): Promise<IExpense> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectExpenses(projectId), input);
    const parsed = parseExpenseList({ expenses: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const row: IExpense = {
    id: uuidv4(),
    projectId,
    title: input.title,
    amount: input.amount,
    currency: input.currency ?? 'USD',
    incurredAt: input.incurredAt,
    category: input.category,
    createdAt: now,
  };
  if (!projectExpensesByProjectId[projectId]) {
    projectExpensesByProjectId[projectId] = [];
  }
  projectExpensesByProjectId[projectId].unshift(row);
  return row;
}
