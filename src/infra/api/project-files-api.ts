import type { IProjectFile, CreateProjectFileInput } from 'src/domain/project-file';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseProjectFileList } from 'src/domain/project-file';
import { projectFilesByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listProjectFilesByProject(projectId: string): Promise<IProjectFile[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectFiles(projectId));
    return parseProjectFileList(res.data);
  }
  const raw = projectFilesByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createProjectFileApi(
  projectId: string,
  input: CreateProjectFileInput
): Promise<IProjectFile> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectFiles(projectId), input);
    const parsed = parseProjectFileList({ files: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const file: IProjectFile = {
    id: uuidv4(),
    projectId,
    name: input.name,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    url: input.url,
    updatedAt: now,
  };
  if (!projectFilesByProjectId[projectId]) {
    projectFilesByProjectId[projectId] = [];
  }
  projectFilesByProjectId[projectId].unshift(file);
  return file;
}
