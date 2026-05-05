import { z } from 'zod';

// ----------------------------------------------------------------------

/** Shortcut to open team chat in context of this project (mock today). */
export const ProjectChatShortcutSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  /** Relative path under dashboard, e.g. `/dashboard/chat` */
  href: z.string(),
});

export const ProjectChatShortcutListSchema = z.object({
  shortcuts: z.array(ProjectChatShortcutSchema),
});

export type IProjectChatShortcut = z.infer<typeof ProjectChatShortcutSchema>;

export function parseProjectChatShortcutList(input: unknown): IProjectChatShortcut[] {
  const result = ProjectChatShortcutListSchema.safeParse(input);
  if (result.success) return result.data.shortcuts;
  if (import.meta.env.DEV) {
    console.error('[domain/project-chat] parse error', result.error.issues);
  }
  return [];
}
