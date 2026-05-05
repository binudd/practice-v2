import { z } from 'zod';

// ----------------------------------------------------------------------

export const ProjectFileSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  url: z.string(),
  updatedAt: z.string(),
});

export const ProjectFileListSchema = z.object({
  files: z.array(ProjectFileSchema),
});

export type IProjectFile = z.infer<typeof ProjectFileSchema>;

export const CreateProjectFileInputSchema = z.object({
  name: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  url: z.string().min(1),
});

export type CreateProjectFileInput = z.infer<typeof CreateProjectFileInputSchema>;

export function parseProjectFileList(input: unknown): IProjectFile[] {
  const result = ProjectFileListSchema.safeParse(input);
  if (result.success) return result.data.files;
  if (import.meta.env.DEV) {
    console.error('[domain/project-file] parse error', result.error.issues);
  }
  return [];
}
