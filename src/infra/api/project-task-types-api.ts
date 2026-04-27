import type { ITaskType, CreateTaskTypeInput } from 'src/domain/task-type';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseTaskTypeList } from 'src/domain/task-type';
import { projectTaskTypesByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listTaskTypesByProject(projectId: string): Promise<ITaskType[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectTaskTypes(projectId));
    return parseTaskTypeList(res.data);
  }
  const raw = projectTaskTypesByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createTaskTypeApi(
  projectId: string,
  input: CreateTaskTypeInput
): Promise<ITaskType> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectTaskTypes(projectId), input);
    const parsed = parseTaskTypeList({ taskTypes: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const row: ITaskType = {
    id: uuidv4(),
    projectId,
    name: input.name,
    description: input.description,
    defaultEstimateHours: input.defaultEstimateHours,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  };
  if (!projectTaskTypesByProjectId[projectId]) {
    projectTaskTypesByProjectId[projectId] = [];
  }
  projectTaskTypesByProjectId[projectId].unshift(row);
  return row;
}
