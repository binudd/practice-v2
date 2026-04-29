import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { UserCardList } from '../user-card-list';

// ----------------------------------------------------------------------

export function UserCardsView() {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'User', href: paths.dashboard.user.root },
      { name: 'Cards' },
    ],
    <Button
      component={RouterLink}
      href={paths.dashboard.user.new}
      variant="contained"
      startIcon={<Iconify icon="mingcute:add-line" />}
    >
      New user
    </Button>,
    []
  );

  return (
    <DashboardContent>
      <UserCardList users={_userCards} />
    </DashboardContent>
  );
}
