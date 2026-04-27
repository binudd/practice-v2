import { z } from 'zod';

// ----------------------------------------------------------------------

export const DiscussionAttachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  url: z.string(),
});

export const DiscussionTopicSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  attachments: z.array(DiscussionAttachmentSchema).default([]),
  hiddenFromClient: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdById: z.string().optional(),
});

export const DiscussionTopicListSchema = z.object({
  topics: z.array(DiscussionTopicSchema),
});

export type IDiscussionAttachment = z.infer<typeof DiscussionAttachmentSchema>;
export type IDiscussionTopic = z.infer<typeof DiscussionTopicSchema>;

export const CreateDiscussionTopicInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  attachments: z.array(DiscussionAttachmentSchema).default([]),
  hiddenFromClient: z.boolean().default(false),
});

export type CreateDiscussionTopicInput = z.infer<typeof CreateDiscussionTopicInputSchema>;

// ----------------------------------------------------------------------

export function parseDiscussionTopicList(input: unknown): IDiscussionTopic[] {
  const result = DiscussionTopicListSchema.safeParse(input);
  if (result.success) return result.data.topics;
  if (import.meta.env.DEV) {
    console.error('[domain/discussion] parse error', result.error.issues);
  }
  return [];
}

/** Topics visible to the current role (clients never see hidden topics). */
export function filterDiscussionTopicsForRole(
  topics: IDiscussionTopic[],
  role: string | undefined
): IDiscussionTopic[] {
  if (role === 'client') {
    return topics.filter((t) => !t.hiddenFromClient);
  }
  return topics;
}
