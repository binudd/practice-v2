import type { AppNotification } from 'src/store/notifications-store';

import { mutate } from 'swr';

import { endpoints } from 'src/utils/axios';

import { useNotificationsStore } from 'src/store/notifications-store';

import type { Unsubscribe, RealtimeAdapter } from './types';

// ----------------------------------------------------------------------

/**
 * Wires well-known server events to client-side side effects: SWR cache
 * invalidations plus store updates. Call once at AuthProvider boot with the
 * active adapter; returns an unsubscribe function that tears everything down
 * on sign-out.
 */
export function registerDefaultHandlers(adapter: RealtimeAdapter): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  // Projects list cache.
  unsubs.push(
    adapter.subscribe('project.updated', () => {
      mutate(endpoints.project.list);
    })
  );
  unsubs.push(
    adapter.subscribe('project.created', () => {
      mutate(endpoints.project.list);
    })
  );
  unsubs.push(
    adapter.subscribe('project.deleted', () => {
      mutate(endpoints.project.list);
    })
  );

  // Per-project kanban boards.
  unsubs.push(
    adapter.subscribe<{ projectId?: string }>('kanban.task.moved', ({ payload }) => {
      const key = payload?.projectId
        ? `${endpoints.kanban}?projectId=${payload.projectId}`
        : endpoints.kanban;
      mutate(key);
    })
  );
  unsubs.push(
    adapter.subscribe('kanban.*', () => {
      // Any other kanban event - safe blanket invalidation of the default board.
      mutate(endpoints.kanban);
    })
  );

  // Timesheet.
  unsubs.push(
    adapter.subscribe('timesheet.entry.updated', () => {
      mutate(endpoints.timesheet);
    })
  );

  // Notifications go straight into the store.
  unsubs.push(
    adapter.subscribe<Omit<AppNotification, 'id' | 'at' | 'read'>>(
      'notification',
      ({ payload }) => {
        if (!payload) return;
        useNotificationsStore.getState().pushSilent(payload);
      }
    )
  );

  return () => unsubs.forEach((u) => u());
}
