import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  project: '/api/project',
  projectDiscussionTopics: (projectId: string) =>
    `/api/project/${projectId}/discussion/topics`,
  projectDiscussionMessages: (topicId: string) =>
    `/api/project/discussion/topics/${topicId}/messages`,
  projectNotes: (projectId: string) => `/api/project/${projectId}/notes`,
  projectFiles: (projectId: string) => `/api/project/${projectId}/files`,
  projectTaskTypes: (projectId: string) => `/api/project/${projectId}/task-types`,
  projectRecurring: (projectId: string) => `/api/project/${projectId}/recurring`,
  projectTimeEntries: (projectId: string) => `/api/project/${projectId}/time-entries`,
  projectExpenses: (projectId: string) => `/api/project/${projectId}/expenses`,
  projectActivity: (projectId: string) => `/api/project/${projectId}/activity`,
  projectAutomations: (projectId: string) => `/api/project/${projectId}/automations`,
  projectChatShortcuts: (projectId: string) => `/api/project/${projectId}/chat-shortcuts`,
  projectMailThreads: (projectId: string) => `/api/project/${projectId}/mail-threads`,
  timesheet: '/api/timesheet',
  permissionSettings: {
    menuList: '/api/permission-settings/menus',
  },
};
