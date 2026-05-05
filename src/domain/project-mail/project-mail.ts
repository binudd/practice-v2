import { z } from 'zod';

// ----------------------------------------------------------------------

export const ProjectMailThreadSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  subject: z.string(),
  snippet: z.string(),
  fromLabel: z.string(),
  receivedAt: z.string(),
  body: z.string().optional(),
});

export const ProjectMailThreadListSchema = z.object({
  threads: z.array(ProjectMailThreadSchema),
});

export type IProjectMailThread = z.infer<typeof ProjectMailThreadSchema>;

export function parseProjectMailThreadList(input: unknown): IProjectMailThread[] {
  const result = ProjectMailThreadListSchema.safeParse(input);
  if (result.success) return result.data.threads;
  if (import.meta.env.DEV) {
    console.error('[domain/project-mail] parse error', result.error.issues);
  }
  return [];
}
