import type { UserRole } from 'src/auth/roles';
import type { IChatMessage } from 'src/types/chat';
import type { IDiscussionTopic, CreateDiscussionTopicInput } from 'src/domain/discussion';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import {
  parseDiscussionTopicList,
  filterDiscussionTopicsForRole,
} from 'src/domain/discussion';
import {
  discussionMessagesByTopicId,
  discussionTopicsByProjectId,
} from 'src/_mock/_project-discussion';

// ----------------------------------------------------------------------
// Mock today; flip USE_SERVER when the backend is ready.

const USE_SERVER = false;

// ----------------------------------------------------------------------

export async function listDiscussionTopicsByProject(
  projectId: string,
  role?: UserRole
): Promise<IDiscussionTopic[]> {
  let list: IDiscussionTopic[];
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectDiscussionTopics(projectId));
    list = parseDiscussionTopicList(res.data);
  } else {
    const raw = discussionTopicsByProjectId[projectId];
    list = raw ? [...raw] : [];
  }
  return filterDiscussionTopicsForRole(list, role);
}

export async function createDiscussionTopicApi(
  projectId: string,
  input: CreateDiscussionTopicInput
): Promise<IDiscussionTopic> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectDiscussionTopics(projectId), input);
    const parsed = parseDiscussionTopicList({ topics: [res.data] });
    return parsed[0]!;
  }

  const now = new Date().toISOString();
  const topic: IDiscussionTopic = {
    id: uuidv4(),
    projectId,
    name: input.name,
    description: input.description,
    attachments: input.attachments ?? [],
    hiddenFromClient: input.hiddenFromClient ?? false,
    createdAt: now,
    updatedAt: now,
    createdById: undefined,
  };

  if (!discussionTopicsByProjectId[projectId]) {
    discussionTopicsByProjectId[projectId] = [];
  }
  discussionTopicsByProjectId[projectId].unshift(topic);
  discussionMessagesByTopicId[topic.id] = [];
  return topic;
}

export async function listDiscussionMessagesByTopic(topicId: string): Promise<IChatMessage[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectDiscussionMessages(topicId));
    return res.data?.messages ?? [];
  }
  const list = discussionMessagesByTopicId[topicId];
  return list ? [...list] : [];
}

export async function sendDiscussionMessageApi(
  projectId: string,
  topicId: string,
  message: IChatMessage
): Promise<void> {
  if (USE_SERVER) {
    await axios.post(endpoints.projectDiscussionMessages(topicId), { message });
    return;
  }
  if (!discussionMessagesByTopicId[topicId]) {
    discussionMessagesByTopicId[topicId] = [];
  }
  discussionMessagesByTopicId[topicId].push(message);

  const topics = discussionTopicsByProjectId[projectId];
  const topic = topics?.find((t) => t.id === topicId);
  if (topic) {
    topic.updatedAt = new Date().toISOString();
  }
}
