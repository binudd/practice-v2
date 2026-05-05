import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

export function UserCreateView() {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'User', href: paths.dashboard.user.root },
      { name: 'New user' },
    ],
    undefined,
    []
  );

  return (
    <DashboardContent>
      <UserNewEditForm />
    </DashboardContent>
  );
}
