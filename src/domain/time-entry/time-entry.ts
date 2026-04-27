import { z } from 'zod';

// ----------------------------------------------------------------------

export const TimeEntrySchema = z.object({
  id: z.string(),
  projectId: z.string(),
  description: z.string(),
  hours: z.number(),
  loggedAt: z.string(),
  userLabel: z.string().optional(),
  createdAt: z.string(),
});

export const TimeEntryListSchema = z.object({
  entries: z.array(TimeEntrySchema),
});

export type ITimeEntry = z.infer<typeof TimeEntrySchema>;

export const CreateTimeEntryInputSchema = z.object({
  description: z.string().min(1),
  hours: z.number().positive(),
  loggedAt: z.string(),
  userLabel: z.string().optional(),
});

export type CreateTimeEntryInput = z.infer<typeof CreateTimeEntryInputSchema>;

export function parseTimeEntryList(input: unknown): ITimeEntry[] {
  const result = TimeEntryListSchema.safeParse(input);
  if (result.success) return result.data.entries;
  if (import.meta.env.DEV) {
    console.error('[domain/time-entry] parse error', result.error.issues);
  }
  return [];
}
