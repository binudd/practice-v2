/** Isolated filter/store keys so default list and module hubs do not clobber each other. */
export const PROJECT_BROWSE_FILTER_KEYS = {
  default: 'project.list',
  templates: 'project.templates',
  recurring: 'project.recurring',
} as const;

export type ProjectBrowseScreenKey =
  (typeof PROJECT_BROWSE_FILTER_KEYS)[keyof typeof PROJECT_BROWSE_FILTER_KEYS];

/** Legacy export — matches `useFiltersStore` default project browse screen (active/completed/overview). */
export const PROJECT_LIST_FILTER_KEY = PROJECT_BROWSE_FILTER_KEYS.default;
