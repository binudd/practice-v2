import { z } from 'zod';

// ----------------------------------------------------------------------

export const ProjectStatusSchema = z.enum(['active', 'on-hold', 'completed', 'archived']);

export const ProjectPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const ProjectBudgetTypeSchema = z.enum(['fixed', 'time_expenses', 'non_billable']);

export const ProjectSettingsFlagsSchema = z.object({
  hiddenFromClient: z.boolean().default(false),
  restrictTaskView: z.boolean().default(false),
  emailNotification: z.boolean().default(false),
  restrictTimesheetHours: z.boolean().default(false),
  notification: z.boolean().default(false),
  enableTimesheetApproval: z.boolean().default(false),
});

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
  referenceNo: z.string().optional(),
  templateId: z.string().optional(),
  projectLeaderId: z.string().optional(),
  projectLeaderName: z.string().optional(),
  category: z.string().optional(),
  group: z.string().optional(),
  department: z.string().optional(),
  clientCompanyName: z.string().optional(),
  budgetHours: z.number().optional(),
  budgetType: ProjectBudgetTypeSchema.optional(),
  customFieldKey: z.string().optional(),
  settings: ProjectSettingsFlagsSchema.optional(),
  /** ISO timestamp when the project record was created */
  createdAt: z.string().optional(),
  /** When the project reached completion (distinct from status alone) */
  completionDate: z.string().optional(),
  budgetAmount: z.number().optional(),
  actualHours: z.number().optional(),
  actualAmount: z.number().optional(),
  /** Planned or contractual hours per day */
  dailyHours: z.number().optional(),
  /** Task rollup placeholder until wired to workflow */
  needsReviewTaskCount: z.number().optional(),
});

export const ProjectListSchema = z.object({
  projects: z.array(ProjectSchema),
});

export type IProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type IProjectPriority = z.infer<typeof ProjectPrioritySchema>;
export type IProjectBudgetType = z.infer<typeof ProjectBudgetTypeSchema>;
export type IProjectSettingsFlags = z.infer<typeof ProjectSettingsFlagsSchema>;
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
