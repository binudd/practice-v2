import type { INote, CreateNoteInput } from 'src/domain/note';

import { uuidv4 } from 'src/utils/uuidv4';
import axios, { endpoints } from 'src/utils/axios';

import { parseNoteList } from 'src/domain/note';
import { projectNotesByProjectId } from 'src/_mock/_project-tab-seeds';

// ----------------------------------------------------------------------

const USE_SERVER = false;

export async function listNotesByProject(projectId: string): Promise<INote[]> {
  if (USE_SERVER) {
    const res = await axios.get(endpoints.projectNotes(projectId));
    return parseNoteList(res.data);
  }
  const raw = projectNotesByProjectId[projectId];
  return raw ? [...raw] : [];
}

export async function createNoteApi(projectId: string, input: CreateNoteInput): Promise<INote> {
  if (USE_SERVER) {
    const res = await axios.post(endpoints.projectNotes(projectId), input);
    const parsed = parseNoteList({ notes: [res.data] });
    return parsed[0]!;
  }
  const now = new Date().toISOString();
  const note: INote = {
    id: uuidv4(),
    projectId,
    title: input.title,
    body: input.body ?? '',
    createdAt: now,
    updatedAt: now,
  };
  if (!projectNotesByProjectId[projectId]) {
    projectNotesByProjectId[projectId] = [];
  }
  projectNotesByProjectId[projectId].unshift(note);
  return note;
}
