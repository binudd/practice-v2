import type { INote } from 'src/domain/note';
import type { IExpense } from 'src/domain/expense';
import type { ITaskType } from 'src/domain/task-type';
import type { ITimeEntry } from 'src/domain/time-entry';
import type { IActivityEvent } from 'src/domain/activity';
import type { IRecurringRule } from 'src/domain/recurring';
import type { IProjectFile } from 'src/domain/project-file';
import type { IAutomationRule } from 'src/domain/automation';
import type { IProjectMailThread } from 'src/domain/project-mail';
import type { IProjectChatShortcut } from 'src/domain/project-chat';

import { paths } from 'src/routes/paths';

import { fSub } from 'src/utils/format-time';

import { _projects } from './_project';

// ----------------------------------------------------------------------

function seedForFirstProjects<T>(factory: (projectId: string, index: number) => T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  _projects.forEach((p, index) => {
    map[p.id] = index < 3 ? factory(p.id, index) : [];
  });
  return map;
}

function buildNotes(projectId: string, index: number): INote[] {
  const t = new Date(Date.now() - (index + 1) * 3600000).toISOString();
  return [
    {
      id: `note-${projectId}-1`,
      projectId,
      title: 'Kickoff decisions',
      body: 'Client prefers weekly status on Fridays. Budget cap confirmed.',
      createdAt: t,
      updatedAt: t,
    },
    {
      id: `note-${projectId}-2`,
      projectId,
      title: 'Parking lot',
      body: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

function buildFiles(projectId: string, index: number): IProjectFile[] {
  const t = fSub({ days: index + 1 });
  return [
    {
      id: `pfile-${projectId}-1`,
      projectId,
      name: 'SOW-draft.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 245000,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      updatedAt: t,
    },
    {
      id: `pfile-${projectId}-2`,
      projectId,
      name: 'wireframes.fig',
      mimeType: 'application/octet-stream',
      sizeBytes: 1200000,
      url: 'https://example.com/wireframes',
      updatedAt: fSub({ hours: 6 }),
    },
  ];
}

function buildTaskTypes(projectId: string, index: number): ITaskType[] {
  const now = new Date().toISOString();
  return [
    {
      id: `tt-${projectId}-1`,
      projectId,
      name: 'Bug',
      description: 'Defect or regression',
      defaultEstimateHours: 4,
      color: 'error',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `tt-${projectId}-2`,
      projectId,
      name: 'Feature',
      defaultEstimateHours: 16,
      color: 'primary',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildRecurring(projectId: string): IRecurringRule[] {
  const now = new Date().toISOString();
  return [
    {
      id: `rec-${projectId}-1`,
      projectId,
      title: 'Sprint planning reminder',
      cadence: 'weekly',
      nextRunAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildTime(projectId: string, index: number): ITimeEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: `time-${projectId}-1`,
      projectId,
      description: 'Design review',
      hours: 2.5,
      loggedAt: fSub({ days: index }),
      userLabel: 'You',
      createdAt: now,
    },
  ];
}

function buildExpenses(projectId: string): IExpense[] {
  const now = new Date().toISOString();
  return [
    {
      id: `exp-${projectId}-1`,
      projectId,
      title: 'Software license',
      amount: 120,
      currency: 'USD',
      incurredAt: fSub({ days: 2 }),
      category: 'Tools',
      createdAt: now,
    },
  ];
}

function buildActivity(projectId: string, index: number): IActivityEvent[] {
  return [
    {
      id: `act-${projectId}-1`,
      projectId,
      kind: 'task',
      message: 'Task moved to In progress',
      actorLabel: 'Alex Kim',
      createdAt: fSub({ hours: 2 + index }),
    },
    {
      id: `act-${projectId}-2`,
      projectId,
      kind: 'file',
      message: 'Uploaded SOW-draft.pdf',
      actorLabel: 'Jamie Lee',
      createdAt: fSub({ hours: 8 }),
    },
  ];
}

function buildAutomation(projectId: string): IAutomationRule[] {
  const now = new Date().toISOString();
  return [
    {
      id: `auto-${projectId}-1`,
      projectId,
      name: 'Notify on blocker',
      triggerLabel: 'Task priority = critical',
      actionLabel: 'Post in Discussion + email PM',
      enabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildChatShortcuts(projectId: string): IProjectChatShortcut[] {
  return [
    {
      id: `pcs-${projectId}-1`,
      projectId,
      title: 'Team chat',
      description: 'Open the main dashboard chat to message collaborators.',
      href: paths.dashboard.chat,
    },
    {
      id: `pcs-${projectId}-2`,
      projectId,
      title: 'Full mail client',
      description: 'Jump to Mail for labels, compose, and search.',
      href: paths.dashboard.mail,
    },
  ];
}

function buildMailThreads(projectId: string, index: number): IProjectMailThread[] {
  return [
    {
      id: `pmail-${projectId}-1`,
      projectId,
      subject: `Re: ${projectId.slice(0, 8)} — timeline`,
      snippet: 'Thanks for the update. We can shift milestone 2 by one week...',
      fromLabel: 'Client team',
      receivedAt: fSub({ hours: 1 + index }),
      body: 'Thanks for the update. We can shift milestone 2 by one week if that unblocks design. Please confirm by EOD.',
    },
  ];
}

// ----------------------------------------------------------------------

export const projectNotesByProjectId: Record<string, INote[]> = structuredClone(
  seedForFirstProjects(buildNotes)
);

export const projectFilesByProjectId: Record<string, IProjectFile[]> = structuredClone(
  seedForFirstProjects(buildFiles)
);

export const projectTaskTypesByProjectId: Record<string, ITaskType[]> = structuredClone(
  seedForFirstProjects(buildTaskTypes)
);

export const projectRecurringByProjectId: Record<string, IRecurringRule[]> = structuredClone(
  seedForFirstProjects(buildRecurring)
);

export const projectTimeEntriesByProjectId: Record<string, ITimeEntry[]> = structuredClone(
  seedForFirstProjects(buildTime)
);

export const projectExpensesByProjectId: Record<string, IExpense[]> = structuredClone(
  seedForFirstProjects(buildExpenses)
);

export const projectActivityByProjectId: Record<string, IActivityEvent[]> = structuredClone(
  seedForFirstProjects(buildActivity)
);

export const projectAutomationByProjectId: Record<string, IAutomationRule[]> = structuredClone(
  seedForFirstProjects(buildAutomation)
);

export const projectChatShortcutsByProjectId: Record<string, IProjectChatShortcut[]> =
  structuredClone(seedForFirstProjects(buildChatShortcuts));

export const projectMailThreadsByProjectId: Record<string, IProjectMailThread[]> =
  structuredClone(seedForFirstProjects(buildMailThreads));
