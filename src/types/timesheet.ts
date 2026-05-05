export type ITimesheetEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  /** Defaults to true when omitted (legacy entries). */
  billable?: boolean;
  note?: string;
  taskId?: string;
  taskName?: string;
};

export interface ITimesheetTaskRowModel {
  rowKey: string;
  userId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  taskId?: string;
  taskName?: string;
  hoursByDate: Record<string, number>;
  entryIds: Record<string, string>;
}
