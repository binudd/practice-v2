import { z } from 'zod';

// ----------------------------------------------------------------------

export const ActivityEventSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  kind: z.enum(['comment', 'status', 'task', 'file', 'member', 'system']),
  message: z.string(),
  actorLabel: z.string().optional(),
  createdAt: z.string(),
});

export const ActivityEventListSchema = z.object({
  events: z.array(ActivityEventSchema),
});

export type IActivityEvent = z.infer<typeof ActivityEventSchema>;

export function parseActivityEventList(input: unknown): IActivityEvent[] {
  const result = ActivityEventListSchema.safeParse(input);
  if (result.success) return result.data.events;
  if (import.meta.env.DEV) {
    console.error('[domain/activity] parse error', result.error.issues);
  }
  return [];
}
