import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { ProjectCreateForm } from '../project-create-form';

// ----------------------------------------------------------------------

export function ProjectCreateView() {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      { name: 'New' },
    ],
    undefined,
    []
  );

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <ProjectCreateForm mode="create" />
      </Box>
    </DashboardContent>
  );
}
