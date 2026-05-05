import type { IProjectChatShortcut } from 'src/domain/project-chat';

import axios, { endpoints } from 'src/utils/axios';

import { parseProjectChatShortcutList } from 'src/domain/project-chat';
import { projectChatShortcutsByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listChatShortcutsByProject(
  projectId: string
): Promise<IProjectChatShortcut[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectChatShortcuts(projectId));
    return parseProjectChatShortcutList(res.data);
  }
  const raw = projectChatShortcutsByProjectId[projectId];
  return raw ? [...raw] : [];
}
