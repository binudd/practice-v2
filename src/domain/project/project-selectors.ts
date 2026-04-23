import type { IProject } from './project';

// ----------------------------------------------------------------------

export const getProjectProgress = (p: IProject): number => {
  if (!p.totalTasks) return 0;
  return Math.round((p.completedTasks / p.totalTasks) * 100);
};

export const getRemainingDays = (p: IProject): number | null => {
  if (!p.endDate) return null;
  const end = new Date(p.endDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
};

export const isOverdue = (p: IProject): boolean => {
  if (!p.endDate || p.status === 'completed' || p.status === 'archived') return false;
  return new Date(p.endDate).getTime() < Date.now();
};

export const getActiveProjects = (projects: IProject[]) =>
  projects.filter((p) => p.status === 'active');

export const getProjectsForClient = (projects: IProject[], clientId: string) =>
  projects.filter((p) => p.clientId === clientId);

export const getProjectsForMember = (projects: IProject[], userId: string) =>
  projects.filter((p) => p.ownerId === userId || p.members.includes(userId));
