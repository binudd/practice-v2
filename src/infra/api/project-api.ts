import type { IProject } from 'src/domain/project';

import axios, { endpoints } from 'src/utils/axios';

import { _projects } from 'src/_mock/_project';
import { parseProjectList } from 'src/domain/project';

// ----------------------------------------------------------------------
// API adapter for the Project resource. Today it serves data from the local
// mock; when the real backend lands, change the bodies below to call axios.
// The action layer (src/actions/project.ts) calls into this module so swapping
// backends is a one-file change.

const USE_SERVER = false;

// ----------------------------------------------------------------------

export async function listProjects(): Promise<IProject[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.project);
    return parseProjectList(res.data);
  }
  return parseProjectList({ projects: _projects });
}

export async function createProjectApi(input: IProject): Promise<IProject> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.project, input);
    return res.data;
  }
  return input;
}

export async function updateProjectApi(id: string, patch: Partial<IProject>): Promise<void> {
  if (USE_SERVER) {
    await axios.patch(`${endpoints.project}/${id}`, patch);
  }
}

export async function deleteProjectApi(id: string): Promise<void> {
  if (USE_SERVER) {
    await axios.delete(`${endpoints.project}/${id}`);
  }
}
