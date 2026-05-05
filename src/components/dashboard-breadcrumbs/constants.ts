import type { BreadcrumbsLinkProps } from 'src/components/custom-breadcrumbs/types';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export const breadcrumbHomeLink: BreadcrumbsLinkProps = {
  name: 'Home',
  href: paths.dashboard.root,
};
