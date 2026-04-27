import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { useGetProject } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProjectCreateForm } from '../project-create-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProjectEditView({ id }: Props) {
  const { project, projectNotFound } = useGetProject(id);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Projects', href: paths.dashboard.project.root },
          { name: project?.name ?? 'Edit' },
        ]}
        sx={{ mb: { xs: 2, md: 3 } }}
      />
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
