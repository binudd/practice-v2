export type ITimesheetEntry = {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  note?: string;
};

export type ITimesheetRow = {
  projectId: string;
  projectName: string;
  projectCode: string;
  hoursByDate: Record<string, number>;
  entryIds: Record<string, string>;
};
