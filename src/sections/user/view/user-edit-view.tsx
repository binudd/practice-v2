import type { IUserItem } from 'src/types/user';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  user?: IUserItem;
};

export function UserEditView({ user: currentUser }: Props) {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'User', href: paths.dashboard.user.root },
      { name: currentUser?.name ?? '' },
    ],
    undefined,
    [currentUser?.id, currentUser?.name]
  );

  return (
    <DashboardContent>
      <UserNewEditForm currentUser={currentUser} />
    </DashboardContent>
  );
}
