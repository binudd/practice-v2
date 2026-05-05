import { z } from 'zod';

// ----------------------------------------------------------------------

export const ExpenseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  incurredAt: z.string(),
  category: z.string().optional(),
  createdAt: z.string(),
});

export const ExpenseListSchema = z.object({
  expenses: z.array(ExpenseSchema),
});

export type IExpense = z.infer<typeof ExpenseSchema>;

export const CreateExpenseInputSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  incurredAt: z.string(),
  category: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseInputSchema>;

export function parseExpenseList(input: unknown): IExpense[] {
  const result = ExpenseListSchema.safeParse(input);
  if (result.success) return result.data.expenses;
  if (import.meta.env.DEV) {
    console.error('[domain/expense] parse error', result.error.issues);
  }
  return [];
}
