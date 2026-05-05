import { create } from 'zustand';
import axios, { endpoints } from 'src/utils/axios';
import { useUserStore } from 'src/store/user-store';
import type { IProject } from 'src/domain/project';

// ----------------------------------------------------------------------

function mapBackendProjectToIProject(raw: any): IProject {
  const mapStatus = (status: string): any => {
    const s = status?.toLowerCase() || '';
    if (s.includes('progress') || s.includes('active')) return 'active';
    if (s.includes('hold')) return 'on-hold';
    if (s.includes('complet')) return 'completed';
    if (s.includes('archiv')) return 'archived';
    return 'active';
  };

  const mapPriority = (pId: number): any => {
    if (pId === 1) return 'high';
    if (pId === 2) return 'medium';
    if (pId === 3) return 'low';
    return 'medium';
  };

  return {
    id: String(raw.projectID || raw.id || ''),
    name: raw.projectName || raw.name || '',
    code: raw.projectCode || raw.code || '',
    status: mapStatus(raw.currentStatus || raw.status),
    startDate: raw.startDate || '',
    endDate: raw.finishDate || raw.endDate,
    ownerId: String(raw.projectOwnerID || raw.ownerId || ''),
    ownerName: raw.projectOwner || raw.ownerName || '',
    members: raw.members || [],
    clientId: String(raw.clientId || ''),
    clientCompanyName: raw.clientCompany || raw.clientCompanyName,
    description: raw.projectDescription || raw.description,
    progress: raw.completionPercentage ?? raw.progress ?? 0,
    totalTasks: raw.totalTasks || 0,
    completedTasks: raw.completedTasks || 0,
    priority: mapPriority(raw.priorityID) || raw.priority || 'medium',
    isFavorite: raw.markFavorite ?? raw.isFavorite ?? false,
    isTemplate: raw.isTemplate ?? false,
    isRecurring: raw.isRecurring ?? false,
    projectLeaderId: String(raw.projectLeaderID || raw.projectLeaderId || ''),
    projectLeaderName: raw.projectLeader || raw.projectLeaderName || '',
    budgetHours: raw.budgetHours || 0,
  };
}

export type ProjectState = {
  projects: IProject[];
  isLoading: boolean;
  error: any | null;
  hasFetched: boolean;
  fetchProjects: (tenantId?: number, searchText?: string) => Promise<void>;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchProjects: async (tenantId?: number, searchText = '') => {
    // If tenantId is not provided, read it from userStore
    const user = useUserStore.getState().user;
    const tenantID = tenantId ?? user?.tenantID ?? 1;

    // If we only want to fetch once and we already have projects (and no search text change),
    // we can avoid refetching. But since search text is dynamic, let's fetch when called.
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(endpoints.project.list + `?tenantId=${tenantID}`, {
        headers: {
          'X-Page-Number': 1,
          'X-Page-Size': 20,
          'X-Search': searchText,
          'X-Sort-By': '',
          'X-Sort-Order': 'asc',
        },
      });

      // Based on common backend patterns, the data might be in response.data or response.data.items
      // We will try to extract an array. If the backend returns our mock structure, it's { projects: [] }
      let rawProjects: any[] = [];
      if (Array.isArray(response.data)) {
        rawProjects = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        rawProjects = response.data.items;
      } else if (response.data && Array.isArray(response.data.data)) {
        rawProjects = response.data.data;
      } else if (response.data && Array.isArray(response.data.projects)) {
        rawProjects = response.data.projects;
      }

      const fetchedProjects = rawProjects.map(mapBackendProjectToIProject);

      set({ projects: fetchedProjects, isLoading: false, hasFetched: true });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      set({ error, isLoading: false, hasFetched: true });
    }
  },
}));
