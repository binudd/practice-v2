import { useMemo } from 'react';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { ProjectCreateForm } from '../project-create-form';

import type { ProjectFormProps } from '../project-create-form';

// ----------------------------------------------------------------------

export function ProjectCreateView() {
  const params = useSearchParams();

  const presetRaw = params.get('preset');
  const creationPreset: ProjectFormProps['creationPreset'] =
    presetRaw === 'template' || presetRaw === 'recurring' ? presetRaw : undefined;

  const breadcrumbs = useMemo(() => {
    if (creationPreset === 'template') {
      return [
        breadcrumbHomeLink,
        { name: 'Projects', href: paths.dashboard.project.root },
        { name: 'Templates', href: paths.dashboard.project.templates.root },
        { name: 'New template' },
      ] as const;
    }
    if (creationPreset === 'recurring') {
      return [
        breadcrumbHomeLink,
        { name: 'Projects', href: paths.dashboard.project.root },
        { name: 'Recurring projects', href: paths.dashboard.project.recurringProjects.root },
        { name: 'New recurring project' },
      ] as const;
    }
    return [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      { name: 'New' },
    ] as const;
  }, [creationPreset]);

  useSetDashboardBreadcrumbs([...breadcrumbs], undefined, [creationPreset]);

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <ProjectCreateForm mode="create" creationPreset={creationPreset} />
      </Box>
    </DashboardContent>
  );
}
