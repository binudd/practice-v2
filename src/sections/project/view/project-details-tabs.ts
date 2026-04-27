// ----------------------------------------------------------------------

export const PROJECT_DETAIL_TABS = [
  { value: 'kanban', label: 'Tasks' },
  { value: 'overview', label: 'Overview' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'task-type', label: 'Task type' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'files', label: 'Files' },
  { value: 'notes', label: 'Notes' },
  { value: 'time', label: 'Time' },
  { value: 'expense', label: 'Expense' },
  { value: 'activity', label: 'Activity' },
  { value: 'automation', label: 'Automation' },
  { value: 'chat', label: 'Chat' },
  { value: 'mail', label: 'Mail' },
] as const;

export type ProjectDetailTabId = (typeof PROJECT_DETAIL_TABS)[number]['value'];

/** First tab in the bar — used when `?tab=` is missing or invalid. */
export const PROJECT_DETAIL_DEFAULT_TAB: ProjectDetailTabId = 'kanban';

const TAB_IDS = new Set<string>(PROJECT_DETAIL_TABS.map((t) => t.value));

export function isValidProjectDetailTabId(value: string | null): value is ProjectDetailTabId {
  return value !== null && TAB_IDS.has(value);
}

export function parseProjectDetailTabParam(param: string | null): ProjectDetailTabId {
  if (isValidProjectDetailTabId(param)) {
    return param;
  }
  return PROJECT_DETAIL_DEFAULT_TAB;
}
