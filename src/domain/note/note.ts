import { z } from 'zod';

// ----------------------------------------------------------------------

export const NoteSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  body: z.string().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const NoteListSchema = z.object({
  notes: z.array(NoteSchema),
});

export type INote = z.infer<typeof NoteSchema>;

export const CreateNoteInputSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  body: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;

export function parseNoteList(input: unknown): INote[] {
  const result = NoteListSchema.safeParse(input);
  if (result.success) return result.data.notes;
  if (import.meta.env.DEV) {
    console.error('[domain/note] parse error', result.error.issues);
  }
  return [];
}
