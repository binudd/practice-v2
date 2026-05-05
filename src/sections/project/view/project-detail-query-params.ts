// Query params used for deep links inside project detail tabs. Cleared when switching tabs.

export const PROJECT_DETAIL_QUERY_KEYS = [
  'topic',
  'note',
  'file',
  'taskType',
  'recurring',
  'timeEntry',
  'expense',
  'activity',
  'automation',
  'mailId',
] as const;

export type ProjectDetailQueryKey = (typeof PROJECT_DETAIL_QUERY_KEYS)[number];
