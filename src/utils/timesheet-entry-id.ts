// ----------------------------------------------------------------------

export function buildTimesheetEntryId(
  userId: string,
  projectId: string,
  isoDate: string,
  taskId?: string
): string {
  const taskPart = taskId && taskId.length > 0 ? taskId : 'none';
  return `ts-${userId}-${projectId}-${isoDate}-${taskPart}`;
}
