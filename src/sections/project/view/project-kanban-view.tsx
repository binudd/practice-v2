import { paths } from 'src/routes/paths';

import { useGetProject } from 'src/actions/project';

import { EmptyContent } from 'src/components/empty-content';
import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { KanbanView } from 'src/sections/kanban/view/kanban-view';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProjectKanbanView({ id }: Props) {
  const { project, projectNotFound } = useGetProject(id);

  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      {
        name: project?.name ?? '…',
        href: project ? paths.dashboard.project.details(project.id) : undefined,
      },
      { name: 'Board' },
    ],
    undefined,
    [project?.id, project?.name, projectNotFound]
  );

  if (projectNotFound) {
    return <EmptyContent title="Project not found" />;
  }

  return <KanbanView projectId={id} title={project?.name ?? 'Kanban'} />;
}
