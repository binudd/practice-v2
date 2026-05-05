import type { UniqueIdentifier } from '@dnd-kit/core';
import type { IKanban, IKanbanTask, IKanbanColumn } from 'src/types/kanban';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

import {
  isKanbanBulkMergeEmpty,
  mergeKanbanTaskBulkPatch,
  type KanbanBulkMergeInput,
} from 'src/domain/kanban/bulk-task-patch';

// ----------------------------------------------------------------------

const enableServer = false;

const KANBAN_ENDPOINT = endpoints.kanban;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type BoardData = {
  board: IKanban;
};

export type KanbanBulkTaskTarget = {
  columnId: UniqueIdentifier;
  taskId: UniqueIdentifier;
};

export function getKanbanSwrKey(kanbanBoardProjectId?: string): string {
  return kanbanBoardProjectId ? `${KANBAN_ENDPOINT}?projectId=${kanbanBoardProjectId}` : KANBAN_ENDPOINT;
}

function mutateKanban(
  kanbanBoardProjectId: string | undefined,
  updater: (currentData: BoardData) => BoardData
) {
  mutate(
    getKanbanSwrKey(kanbanBoardProjectId),
    (currentData) => {
      if (!currentData) return currentData;
      return updater(currentData as BoardData);
    },
    false
  );
}

export function useGetBoard(projectId?: string) {
  const endpoint = getKanbanSwrKey(projectId);

  const { data, isLoading, error, isValidating } = useSWR<BoardData>(
    endpoint,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const tasks = data?.board.tasks ?? {};
    const columns = data?.board.columns ?? [];

    return {
      board: { tasks, columns },
      boardLoading: isLoading,
      boardError: error,
      boardValidating: isValidating,
      boardEmpty: !isLoading && !columns.length,
    };
  }, [data?.board.columns, data?.board.tasks, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createColumn(
  columnData: IKanbanColumn,
  kanbanBoardProjectId?: string
) {
  if (enableServer) {
    const data = { columnData };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'create-column' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const columns = [...board.columns, columnData];

    const tasks = { ...board.tasks, [columnData.id]: [] };

    return { ...currentData, board: { ...board, columns, tasks } };
  });
}

// ----------------------------------------------------------------------

export async function updateColumn(
  columnId: UniqueIdentifier,
  columnName: string,
  kanbanBoardProjectId?: string
) {
  if (enableServer) {
    const data = { columnId, columnName };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'update-column' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const columns = board.columns.map((column) =>
      column.id === columnId ? { ...column, name: columnName } : column
    );

    return { ...currentData, board: { ...board, columns } };
  });
}

// ----------------------------------------------------------------------

export async function moveColumn(updateColumns: IKanbanColumn[], kanbanBoardProjectId?: string) {
  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    return { ...currentData, board: { ...board, columns: updateColumns } };
  });

  if (enableServer) {
    const data = { updateColumns };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'move-column' } });
  }
}

// ----------------------------------------------------------------------

export async function clearColumn(columnId: UniqueIdentifier, kanbanBoardProjectId?: string) {
  if (enableServer) {
    const data = { columnId };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'clear-column' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const tasks = { ...board.tasks, [columnId]: [] };

    return { ...currentData, board: { ...board, tasks } };
  });
}

// ----------------------------------------------------------------------

export async function deleteColumn(columnId: UniqueIdentifier, kanbanBoardProjectId?: string) {
  if (enableServer) {
    const data = { columnId };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'delete-column' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const columns = board.columns.filter((column) => column.id !== columnId);

    const tasks = Object.keys(board.tasks)
      .filter((key) => key !== columnId)
      .reduce((obj: IKanban['tasks'], key) => {
        obj[key] = board.tasks[key];
        return obj;
      }, {});

    return { ...currentData, board: { ...board, columns, tasks } };
  });
}

// ----------------------------------------------------------------------

export async function createTask(
  columnId: UniqueIdentifier,
  taskData: IKanbanTask,
  kanbanBoardProjectId?: string
) {
  if (enableServer) {
    const data = { columnId, taskData };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'create-task' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const columnTasks = board.tasks[columnId] ?? [];
    const tasks = {
      ...board.tasks,
      [columnId]: [taskData, ...columnTasks],
    };

    return { ...currentData, board: { ...board, tasks } };
  });
}

// ----------------------------------------------------------------------

export async function updateTask(
  columnId: UniqueIdentifier,
  taskData: IKanbanTask,
  kanbanBoardProjectId?: string
) {
  if (enableServer) {
    const data = { columnId, taskData };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'update-task' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const tasksInColumn = board.tasks[columnId];

    const updateTasks =
      tasksInColumn?.map((task) =>
        task.id === taskData.id ? { ...task, ...taskData } : task
      ) ?? [];

    const tasks = { ...board.tasks, [columnId]: updateTasks };

    return { ...currentData, board: { ...board, tasks } };
  });
}

// ----------------------------------------------------------------------

export async function moveTask(updateTasks: IKanban['tasks'], kanbanBoardProjectId?: string) {
  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    return { ...currentData, board: { ...board, tasks: updateTasks } };
  });

  if (enableServer) {
    const data = { updateTasks };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'move-task' } });
  }
}

// ----------------------------------------------------------------------

export async function deleteTask(
  columnId: UniqueIdentifier,
  taskId: UniqueIdentifier,
  kanbanBoardProjectId?: string
) {
  if (enableServer) {
    const data = { columnId, taskId };
    await axios.post(KANBAN_ENDPOINT, data, { params: { endpoint: 'delete-task' } });
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    const tasks = {
      ...board.tasks,
      [columnId]: board.tasks[columnId]?.filter((task) => task.id !== taskId) ?? [],
    };

    return { ...currentData, board: { ...board, tasks } };
  });
}

export type BulkUpdateKanbanTasksResult = { updated: number; skipped: number };

/**
 * Applies the same merged patch shape to multiple tasks.Mutates the scoped board cache once.
 */
export async function bulkUpdateKanbanTasks(
  kanbanBoardProjectId: string | undefined,
  targets: readonly KanbanBulkTaskTarget[],
  mergeInput: KanbanBulkMergeInput
): Promise<BulkUpdateKanbanTasksResult> {
  let updated = 0;
  let skipped = 0;

  if (isKanbanBulkMergeEmpty(mergeInput)) {
    skipped = targets.length;
    return { updated, skipped };
  }

  mutateKanban(kanbanBoardProjectId, (currentData) => {
    const { board } = currentData;

    updated = 0;
    skipped = 0;

    const nextTasks: IKanban['tasks'] = { ...board.tasks };

    targets.forEach(({ columnId, taskId }) => {
      const tasksInColumn = nextTasks[columnId];
      if (!tasksInColumn) {
        skipped += 1;
        return;
      }
      const idx = tasksInColumn.findIndex((t) => t.id === taskId);
      if (idx < 0) {
        skipped += 1;
        return;
      }
      const task = tasksInColumn[idx];
      const merged = mergeKanbanTaskBulkPatch(task, mergeInput);
      nextTasks[columnId] = [
        ...tasksInColumn.slice(0, idx),
        merged,
        ...tasksInColumn.slice(idx + 1),
      ];
      updated += 1;
    });

    return { ...currentData, board: { ...board, tasks: nextTasks } };
  });

  return { updated, skipped };
}

export type { KanbanBulkMergeInput } from 'src/domain/kanban/bulk-task-patch';
