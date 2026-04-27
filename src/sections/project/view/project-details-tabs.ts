// Solar `*-bold` icons — names reused from elsewhere in this app where possible (Iconify).

export const PROJECT_DETAIL_TABS = [
  { value: 'kanban', label: 'Tasks', icon: 'solar:list-check-bold' },
  { value: 'overview', label: 'Overview', icon: 'solar:info-circle-bold' },
  { value: 'discussion', label: 'Discussion', icon: 'solar:chat-round-dots-bold' },
  { value: 'task-type', label: 'Task type', icon: 'solar:layers-bold' },
  { value: 'recurring', label: 'Recurring', icon: 'solar:calendar-bold' },
  { value: 'files', label: 'Files', icon: 'solar:document-bold' },
  { value: 'notes', label: 'Notes', icon: 'solar:notes-bold' },
  { value: 'time', label: 'Time', icon: 'solar:clock-circle-bold' },
  { value: 'expense', label: 'Expense', icon: 'solar:bill-list-bold' },
  { value: 'activity', label: 'Activity', icon: 'solar:refresh-bold' },
  { value: 'automation', label: 'Automation', icon: 'solar:bolt-bold' },
  { value: 'chat', label: 'Chat', icon: 'solar:chat-round-bold' },
  { value: 'mail', label: 'Mail', icon: 'solar:letter-bold' },
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
