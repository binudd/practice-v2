import type { IProject } from 'src/domain/project';

import axios, { endpoints } from 'src/utils/axios';

import { _projects } from 'src/_mock/_project';
import { parseProjectList } from 'src/domain/project';

// ----------------------------------------------------------------------
// API adapter for the Project resource. Today it serves data from the local
// mock; when the real backend lands, change the bodies below to call axios.
// The action layer (src/actions/project.ts) calls into this module so swapping
// backends is a one-file change.

import { useUserStore } from 'src/store';
import { mapProjectFromApi, mapProjectToApi } from 'src/domain/project/project-mapper';

// ----------------------------------------------------------------------

const USE_SERVER = true; // Switching to server as per user request

// ----------------------------------------------------------------------

function getTenantId() {
  return useUserStore.getState().user?.tenantID || 1;
}

function getUserRoleType() {
  return useUserStore.getState().user?.userRoleType || 1;
}

// ----------------------------------------------------------------------

export async function listProjects(): Promise<IProject[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.project.list);
    // Assuming the list response also needs mapping if it follows the same PascalCase
    return (res.data || []).map(mapProjectFromApi);
  }
  return parseProjectList({ projects: _projects });
}

export async function getProjectApi(id: string): Promise<IProject> {
  const res = await axios.get(endpoints.project.get(id));
  return mapProjectFromApi(res.data);
}

export async function createProjectApi(input: IProject): Promise<IProject> {
  if (USE_SERVER) {
    const payload = mapProjectToApi(input);
    const res = await axios.post(endpoints.project.save, payload);
    return mapProjectFromApi(res.data);
  }
  return input;
}

export async function updateProjectApi(id: string, patch: Partial<IProject>): Promise<void> {
  if (USE_SERVER) {
    const payload = mapProjectToApi({ ...patch, id });
    await axios.post(endpoints.project.save, payload); // Save often handles both create and update
  }
}

export async function deleteProjectApi(id: string): Promise<void> {
  if (USE_SERVER) {
    await axios.post(endpoints.project.delete, { projectID: Number(id) });
  }
}

// ----------------------------------------------------------------------
// Lookups moved to lookup-api.ts

