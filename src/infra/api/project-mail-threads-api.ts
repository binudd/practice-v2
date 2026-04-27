import type { IProjectMailThread } from 'src/domain/project-mail';

import axios, { endpoints } from 'src/utils/axios';

import { parseProjectMailThreadList } from 'src/domain/project-mail';
import { projectMailThreadsByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listMailThreadsByProject(
  projectId: string
): Promise<IProjectMailThread[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectMailThreads(projectId));
    return parseProjectMailThreadList(res.data);
  }
  const raw = projectMailThreadsByProjectId[projectId];
  return raw ? [...raw] : [];
}
