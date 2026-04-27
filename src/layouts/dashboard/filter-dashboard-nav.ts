import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/**
 * When the user cannot create projects, the Projects nav item should be a single
 * link to the list (no List / New subtree).
 */
export function filterDashboardNavByProjectCreate(
  data: NavSectionProps['data'],
  canCreateProject: boolean
): NavSectionProps['data'] {
  if (canCreateProject) {
    return data;
  }

  return data.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.path !== paths.dashboard.project.root) {
        return item;
      }
      const next = { ...item };
      delete next.children;
      return next;
    }),
  }));
}
