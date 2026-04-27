import { z } from 'zod';

// ----------------------------------------------------------------------

export const ProjectStatusSchema = z.enum(['active', 'on-hold', 'completed', 'archived']);

export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high']);

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: ProjectStatusSchema,
  startDate: z.string(),
  endDate: z.string().optional(),
  ownerId: z.string(),
  ownerName: z.string(),
  members: z.array(z.string()),
  clientId: z.string().optional(),
  description: z.string().optional(),
  progress: z.number(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  priority: ProjectPrioritySchema.default('medium'),
  isFavorite: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
});

export const ProjectListSchema = z.object({
  projects: z.array(ProjectSchema),
});

export type IProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type IProjectPriority = z.infer<typeof ProjectPrioritySchema>;
export type IProject = z.infer<typeof ProjectSchema>;

// ----------------------------------------------------------------------

/** Permissive parser: logs and returns an empty list on shape errors so a bad
 *  backend response doesn't brick the UI, but still complains in dev. */
export function parseProjectList(input: unknown): IProject[] {
  const result = ProjectListSchema.safeParse(input);
  if (result.success) return result.data.projects;
  if (import.meta.env.DEV) {
    console.error('[domain/project] parse error', result.error.issues);
  }
  return [];
}
