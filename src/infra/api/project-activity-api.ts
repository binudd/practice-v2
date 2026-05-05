import type { IActivityEvent } from 'src/domain/activity';

import axios, { endpoints } from 'src/utils/axios';

import { parseActivityEventList } from 'src/domain/activity';
import { projectActivityByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listActivityByProject(projectId: string): Promise<IActivityEvent[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectActivity(projectId));
    return parseActivityEventList(res.data);
  }
  const raw = projectActivityByProjectId[projectId];
  return raw ? [...raw] : [];
}
