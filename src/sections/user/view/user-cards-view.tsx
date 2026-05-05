import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import {
  breadcrumbHomeLink,
  useSetDashboardBreadcrumbs,
  DashboardToolbarPrimaryButton,
} from 'src/components/dashboard-breadcrumbs';

import { UserCardList } from '../user-card-list';

// ----------------------------------------------------------------------

export function UserCardsView() {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'User', href: paths.dashboard.user.root },
      { name: 'Cards' },
    ],
    <DashboardToolbarPrimaryButton
      component={RouterLink}
      href={paths.dashboard.user.new}
      startIcon={<Iconify icon="mingcute:add-line" />}
    >
      New user
    </DashboardToolbarPrimaryButton>,
    []
  );

  return (
    <DashboardContent>
      <UserCardList users={_userCards} />
    </DashboardContent>
  );
}
