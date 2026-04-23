import { useGetProject } from 'src/actions/project';

import { EmptyContent } from 'src/components/empty-content';

import { KanbanView } from 'src/sections/kanban/view/kanban-view';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function ProjectKanbanView({ id }: Props) {
  const { project, projectNotFound } = useGetProject(id);

  if (projectNotFound) {
    return <EmptyContent title="Project not found" />;
  }

  return <KanbanView projectId={id} title={project?.name ?? 'Kanban'} />;
}
