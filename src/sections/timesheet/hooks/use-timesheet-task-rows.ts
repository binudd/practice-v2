import type { ITimesheetEntry, ITimesheetTaskRowModel } from 'src/types/timesheet';

import { useMemo } from 'react';

import { _projects } from 'src/_mock/_project';
import { getTasksForProject } from 'src/_mock/_timesheet-tasks';

// ----------------------------------------------------------------------

export function buildTaskRowsForUser(
  userId: string,
  entries: ITimesheetEntry[],
  weekDays: string[]
): ITimesheetTaskRowModel[] {
  const filtered = entries.filter((e) => e.userId === userId && weekDays.includes(e.date));
  const keySet = new Set<string>();
  filtered.forEach((e) => {
    keySet.add(`${e.projectId}::${e.taskId ?? ''}`);
  });

  const keys = Array.from(keySet).map((k) => {
    const [projectId, taskPart] = k.split('::');
    return { projectId, taskId: taskPart || undefined };
  });

  keys.sort((a, b) => {
    const pa = _projects.find((p) => p.id === a.projectId)?.name ?? a.projectId;
    const pb = _projects.find((p) => p.id === b.projectId)?.name ?? b.projectId;
    if (pa !== pb) return pa.localeCompare(pb);
    const ta =
      filtered.find((e) => e.projectId === a.projectId && (e.taskId ?? '') === (a.taskId ?? ''))
        ?.taskName ?? '';
    const tb =
      filtered.find((e) => e.projectId === b.projectId && (e.taskId ?? '') === (b.taskId ?? ''))
        ?.taskName ?? '';
    return ta.localeCompare(tb);
  });

  return keys.map(({ projectId, taskId }) => {
    const project = _projects.find((p) => p.id === projectId);
    const taskName =
      filtered.find((e) => e.projectId === projectId && (e.taskId ?? '') === (taskId ?? ''))
        ?.taskName ??
      getTasksForProject(projectId).find((t) => t.id === taskId)?.name ??
      '';

    const hoursByDate: Record<string, number> = {};
    const entryIds: Record<string, string> = {};
    weekDays.forEach((d) => {
      hoursByDate[d] = 0;
      entryIds[d] = '';
    });
    filtered
      .filter((e) => e.projectId === projectId && (e.taskId ?? '') === (taskId ?? ''))
      .forEach((e) => {
        hoursByDate[e.date] = e.hours;
        entryIds[e.date] = e.id;
      });

    return {
      rowKey: `${userId}-${projectId}-${taskId ?? 'none'}`,
      userId,
      projectId,
      projectName: project?.name ?? projectId,
      projectCode: project?.code ?? '',
      taskId,
      taskName,
      hoursByDate,
      entryIds,
    };
  });
}

export function useTimesheetTaskRows(
  userId: string,
  entries: ITimesheetEntry[],
  weekDays: string[]
) {
  return useMemo(
    () => buildTaskRowsForUser(userId, entries, weekDays),
    [userId, entries, weekDays]
  );
}
