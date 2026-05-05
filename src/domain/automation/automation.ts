import { z } from 'zod';

// ----------------------------------------------------------------------

export const AutomationRuleSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  triggerLabel: z.string(),
  actionLabel: z.string(),
  enabled: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AutomationRuleListSchema = z.object({
  rules: z.array(AutomationRuleSchema),
});

export type IAutomationRule = z.infer<typeof AutomationRuleSchema>;

export const CreateAutomationRuleInputSchema = z.object({
  name: z.string().min(1),
  triggerLabel: z.string().min(1),
  actionLabel: z.string().min(1),
  enabled: z.boolean().default(true),
});

export type CreateAutomationRuleInput = z.infer<typeof CreateAutomationRuleInputSchema>;

export function parseAutomationRuleList(input: unknown): IAutomationRule[] {
  const result = AutomationRuleListSchema.safeParse(input);
  if (result.success) return result.data.rules;
  if (import.meta.env.DEV) {
    console.error('[domain/automation] parse error', result.error.issues);
  }
  return [];
}
