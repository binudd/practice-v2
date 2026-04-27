import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProjectCreateForm } from '../project-create-form';

// ----------------------------------------------------------------------

export function ProjectCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Projects', href: paths.dashboard.project.root },
          { name: 'New' },
        ]}
        sx={{ mb: { xs: 2, md: 3 } }}
      />
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <ProjectCreateForm mode="create" />
      </Box>
    </DashboardContent>
  );
}
