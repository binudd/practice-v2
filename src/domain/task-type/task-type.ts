import { z } from 'zod';

// ----------------------------------------------------------------------

export const TaskTypeSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  defaultEstimateHours: z.number().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TaskTypeListSchema = z.object({
  taskTypes: z.array(TaskTypeSchema),
});

export type ITaskType = z.infer<typeof TaskTypeSchema>;

export const CreateTaskTypeInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  defaultEstimateHours: z.number().optional(),
  color: z.string().optional(),
});

export type CreateTaskTypeInput = z.infer<typeof CreateTaskTypeInputSchema>;

export function parseTaskTypeList(input: unknown): ITaskType[] {
  const result = TaskTypeListSchema.safeParse(input);
  if (result.success) return result.data.taskTypes;
  if (import.meta.env.DEV) {
    console.error('[domain/task-type] parse error', result.error.issues);
  }
  return [];
}
