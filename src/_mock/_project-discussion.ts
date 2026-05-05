import type { IChatMessage } from 'src/types/chat';
import type { IDiscussionTopic } from 'src/domain/discussion';

import { fSub } from 'src/utils/format-time';

import { _projects } from './_project';

// ----------------------------------------------------------------------

function seedMessagesForTopic(projectId: string, topicId: string): IChatMessage[] {
  const project = _projects.find((p) => p.id === projectId);
  const ownerId = project?.ownerId ?? 'peer-1';
  const demoUserId = '8864c717-587d-472a-929a-8e5f298024da-0';

  return [
    {
      id: `msg-${topicId}-a`,
      body: 'Thanks — posting the latest updates here.',
      senderId: ownerId,
      contentType: 'text',
      createdAt: fSub({ hours: 3 }),
      attachments: [],
    },
    {
      id: `msg-${topicId}-b`,
      body: 'Sounds good. I will review by EOD.',
      senderId: demoUserId,
      contentType: 'text',
      createdAt: fSub({ hours: 1 }),
      attachments: [],
    },
  ];
}

function seedTopicsForProject(projectId: string, index: number): IDiscussionTopic[] {
  const t0 = new Date(Date.now() - (index + 1) * 86400000).toISOString();
  const t1 = new Date(Date.now() - (index + 2) * 43200000).toISOString();

  return [
    {
      id: `dtopic-${projectId}-1`,
      projectId,
      name: 'Kickoff and scope',
      description: 'Align on milestones, owners, and client deliverables.',
      attachments: [
        {
          id: `att-${projectId}-1`,
          fileName: 'scope-notes.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
      ],
      hiddenFromClient: false,
      createdAt: t0,
      updatedAt: t0,
      createdById: undefined,
    },
    {
      id: `dtopic-${projectId}-2`,
      projectId,
      name: 'Internal — budget review',
      description: 'Internal discussion; not visible to client users.',
      attachments: [],
      hiddenFromClient: true,
      createdAt: t1,
      updatedAt: t1,
      createdById: undefined,
    },
  ];
}

function buildInitialByProject(): Record<string, IDiscussionTopic[]> {
  const map: Record<string, IDiscussionTopic[]> = {};
  _projects.forEach((p, index) => {
    // Seed first three projects with sample threads so demos have data.
    if (index < 3) {
      map[p.id] = seedTopicsForProject(p.id, index);
    } else {
      map[p.id] = [];
    }
  });
  return map;
}

/** Mutable in-memory message threads (mock API). */
export const discussionMessagesByTopicId: Record<string, IChatMessage[]> = {};

const initialTopicsByProject = buildInitialByProject();

Object.entries(initialTopicsByProject).forEach(([projectId, topics]) => {
  topics.forEach((topic) => {
    discussionMessagesByTopicId[topic.id] = seedMessagesForTopic(projectId, topic.id);
  });
});

/** Mutable in-memory store for mock API (clone on init). */
export const discussionTopicsByProjectId: Record<string, IDiscussionTopic[]> = structuredClone(
  initialTopicsByProject
);
