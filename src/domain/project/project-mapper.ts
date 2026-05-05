import type { IProject, IProjectStatus } from './project';

// ----------------------------------------------------------------------

/**
 * Maps a backend project response to our frontend IProject interface.
 * Handles the PascalCase -> camelCase conversion and type normalization.
 */
export function mapProjectFromApi(data: any): IProject {
  return {
    id: String(data.projectID),
    name: data.projectName || '',
    code: data.projectCode || '',
    status: mapStatusFromApi(data.currentStatusName || (data.currentStatus === 10049 ? 'In Progress' : '')),
    statusId: data.currentStatus ? String(data.currentStatus) : undefined,
    priorityId: data.priorityID ? String(data.priorityID) : undefined,
    startDate: data.startDate || '',
    endDate: data.finishDate || '',
    ownerId: String(data.projectOwner),
    ownerName: data.projectOwnerName || '',
    members: [], // API doesn't seem to return a flat member list in this call
    clientId: data.clientID ? String(data.clientID) : undefined,
    description: data.projectDescription || '',
    progress: 0, // Should be calculated or fetched separately if needed
    totalTasks: 0,
    completedTasks: 0,
    priority: mapPriorityFromApi(data.priorityID),
    isFavorite: !!data.markFavorite,
    isTemplate: false,
    isRecurring: false,
    referenceNo: data.referenceNo || '',
    templateId: data.projectTemplateID ? String(data.projectTemplateID) : undefined,
    projectLeaderId: data.projectLeader ? String(data.projectLeader) : undefined,
    projectLeaderName: data.projectLeaderName || '',
    category: data.categoryID ? String(data.categoryID) : undefined,
    department: data.deptID ? String(data.deptID) : undefined,
    budgetHours: data.budgetHours || 0,
    budgetType: mapBudgetTypeFromApi(data.budgetType),
    dailyHours: data.dailyWorkingHours || 0,
    completionDate: data.completionDate || undefined,
    budgetAmount: Number(data.revenueAmount) || 0,
    createdAt: data.createdOn || '',
    settings: {
      hiddenFromClient: !!data.hideClient,
      restrictTaskView: !!data.restrictTaskViewToMembers,
      emailNotification: !!data.enableEmailNotification,
      restrictTimesheetHours: !!data.restrictTimeSheetHours,
      notification: !!data.enableNotification,
      enableTimesheetApproval: !!data.enableApproval,
    },
  };
}

/**
 * Maps frontend IProject back to backend payload for Save/Update.
 */
export function mapProjectToApi(project: Partial<IProject>): any {
  return {
    projectID: project.id ? Number(project.id) : 0,
    projectName: project.name,
    projectCode: project.code,
    startDate: project.startDate,
    finishDate: project.endDate,
    projectOwner: project.ownerId ? Number(project.ownerId) : 0,
    clientID: project.clientId ? Number(project.clientId) : 0,
    projectDescription: project.description,
    budgetHours: project.budgetHours,
    dailyWorkingHours: project.dailyHours,
    markFavorite: project.isFavorite,
    hideClient: project.settings?.hiddenFromClient,
    restrictTaskViewToMembers: project.settings?.restrictTaskView,
    enableEmailNotification: project.settings?.emailNotification,
    restrictTimeSheetHours: project.settings?.restrictTimesheetHours,
    enableNotification: project.settings?.notification,
    enableApproval: project.settings?.enableTimesheetApproval,
    // Add other fields as per API spec
  };
}

function mapStatusFromApi(statusName: string): IProjectStatus {
  const s = (statusName || '').toLowerCase();
  if (s.includes('complet')) return 'completed';
  if (s.includes('hold')) return 'on-hold';
  if (s.includes('archiv')) return 'archived';
  if (s.includes('progress') || s.includes('active') || s.includes('new')) return 'active';
  return 'active';
}

function mapPriorityFromApi(id: number): any {
  if (id === 1) return 'high';
  if (id === 2) return 'medium';
  if (id === 3) return 'low';
  return 'critical';
}

function mapBudgetTypeFromApi(typeId: number): any {
  if (typeId === 1) return 'fixed';
  if (typeId === 2) return 'time_expenses';
  return 'non_billable';
}
