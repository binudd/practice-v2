import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: `${CONFIG.site.serverUrl}/api` });

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('jwt_access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  chat: '/chat',
  kanban: '/kanban',
  calendar: '/calendar',
  auth: {
    me: '/auth/me',
    signIn: '/Users/LoginModel',
    signUp: '/auth/sign-up',
  },
  mail: {
    list: '/mail/list',
    details: '/mail/details',
    labels: '/mail/labels',
  },
  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },
  product: {
    list: '/product/list',
    details: '/product/details',
    search: '/product/search',
  },
  project: {
    list: '/Project/v2/GetList',
    get: (id: string) => `/Project/Get?id=${id}`,
    save: '/Project/Save',
    delete: '/Project/Delete',
    settings: '/Settings/Get',
    status: (tenantId: number) => `/Status/GetByTransType?TransTypeId=4&TenantID=${tenantId}`,
    company: (tenantId: number) => `/Company/GetList?TenantID=${tenantId}`,
    department: (tenantId: number) => `/Department/GetList?TenantID=${tenantId}`,
    currency: (tenantId: number) => `/Currency/GetList?TenantID=${tenantId}`,
    jobType: (tenantId: number) => `/JobType/GetList?TenantID=${tenantId}`,
    portfolio: (tenantId: number) => `/ProjectPortFolio/GetList?TenantID=${tenantId}`,
    templates: (tenantId: number) => `/Template/GetList?TenantID=${tenantId}`,
    templateDetails: (templateId: number) => `/Template/Get?TemplateID=${templateId}`,
    users: (tenantId: number, roleType: number) => `/Users/GetMembers?TenantID=${tenantId}&userRoleType=${roleType}`,
    customFields: (tenantId: number) => `/CustomField/GetByTenantId?tenantId=${tenantId}`,
    category: (tenantId: number) => `/ProjectPortFolio/GetList?TenantID=${tenantId}`,
    group: (tenantId: number) => `/Category/GetByTransType?TransTypeId=4&TenantID=${tenantId}`,
  },
  projectActivity: (id: string) => `/Project/Activity?id=${id}`,
  projectAutomations: (id: string) => `/Project/Automations?id=${id}`,
  projectChatShortcuts: (id: string) => `/Project/ChatShortcuts?id=${id}`,
  projectDiscussion: (id: string) => `/Project/Discussion?id=${id}`,
  projectDiscussionTopics: (id: string) => `/Project/Discussion/Topics?id=${id}`,
  projectDiscussionMessages: (topicId: string) => `/Project/Discussion/Messages?topicId=${topicId}`,
  projectExpenses: (id: string) => `/Project/Expenses?id=${id}`,
  projectFiles: (id: string) => `/Project/Files?id=${id}`,
  projectMailThreads: (id: string) => `/Project/MailThreads?id=${id}`,
  projectNotes: (id: string) => `/Project/Notes?id=${id}`,
  projectRecurring: (id: string) => `/Project/Recurring?id=${id}`,
  projectTaskTypes: (id: string) => `/Project/TaskTypes?id=${id}`,
  projectTimeEntries: (id: string) => `/Project/TimeEntries?id=${id}`,
  timesheet: '/timesheet',
  permissionSettings: {
    menuList: '/Menu/GetListMenu',
    roleList: '/Role/GetListRole',
    getRole: '/Role/Get',
    saveRole: '/UserRole/Save',
    deleteRole: '/UserRole/Delete',
  },
};
