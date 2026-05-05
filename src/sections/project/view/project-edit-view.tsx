import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { useGetProject } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { ProjectCreateForm } from '../project-create-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProjectEditView({ id }: Props) {
  const { project, projectNotFound } = useGetProject(id);

  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      { name: project?.name ?? 'Edit' },
    ],
    undefined,
    [project?.name, project?.id, projectNotFound]
  );

  return (
    <DashboardContent>
      {projectNotFound ? (
        <EmptyContent title="Project not found" />
      ) : (
        project && (
          <Box sx={{ maxWidth: 920, mx: 'auto' }}>
            <ProjectCreateForm mode="edit" current={project} />
          </Box>
        )
      )}
    </DashboardContent>
  );
}
