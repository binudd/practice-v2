import { z } from 'zod';

// ----------------------------------------------------------------------

export const RecurringRuleSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  cadence: z.enum(['daily', 'weekly', 'monthly']),
  nextRunAt: z.string(),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RecurringRuleListSchema = z.object({
  rules: z.array(RecurringRuleSchema),
});

export type IRecurringRule = z.infer<typeof RecurringRuleSchema>;

export const CreateRecurringRuleInputSchema = z.object({
  title: z.string().min(1),
  cadence: z.enum(['daily', 'weekly', 'monthly']),
  nextRunAt: z.string(),
  enabled: z.boolean().default(true),
});

export type CreateRecurringRuleInput = z.infer<typeof CreateRecurringRuleInputSchema>;

export function parseRecurringRuleList(input: unknown): IRecurringRule[] {
  const result = RecurringRuleListSchema.safeParse(input);
  if (result.success) return result.data.rules;
  if (import.meta.env.DEV) {
    console.error('[domain/recurring] parse error', result.error.issues);
  }
  return [];
}
