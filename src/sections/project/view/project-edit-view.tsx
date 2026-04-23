import { paths } from 'src/routes/paths';

import { useGetProject } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProjectNewEditForm } from '../project-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProjectEditView({ id }: Props) {
  const { project, projectNotFound } = useGetProject(id);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit project"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Projects', href: paths.dashboard.project.root },
          { name: project?.name ?? 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {projectNotFound ? (
        <EmptyContent title="Project not found" />
      ) : (
        <ProjectNewEditForm current={project} />
      )}
    </DashboardContent>
  );
}
