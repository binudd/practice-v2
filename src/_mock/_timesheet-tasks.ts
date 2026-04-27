import { _projects } from './_project';

// ----------------------------------------------------------------------

const LABELS = ['Design', 'Implementation', 'QA review', 'Documentation', 'Meetings'];

export type TimesheetTaskOption = { id: string; name: string };

export function getTasksForProject(projectId: string): TimesheetTaskOption[] {
  const project = _projects.find((p) => p.id === projectId);
  if (!project) {
    return [];
  }
  return LABELS.map((label, index) => ({
    id: `${projectId}-task-${index}`,
    name: `${label} · ${project.code}`,
  }));
}
