import { toast } from 'sonner';

import { createStore } from './create';

// ----------------------------------------------------------------------

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description?: string;
  /** Epoch ms when it was queued. */
  at: number;
  read?: boolean;
};

export type NotificationsState = {
  items: AppNotification[];
  unreadCount: number;

  /** Push a notification AND fire a matching sonner toast in one call. */
  push: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => string;
  /** Push a notification without showing a toast (e.g. from realtime events while the user is away). */
  pushSilent: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

// ----------------------------------------------------------------------

const MAX = 50;

const nextId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const recomputeUnread = (items: AppNotification[]) =>
  items.reduce((acc, n) => (n.read ? acc : acc + 1), 0);

// ----------------------------------------------------------------------

export const useNotificationsStore = createStore<NotificationsState>(
  'notifications',
  (set) => ({
    items: [],
    unreadCount: 0,

    push: (input) => {
      const id = nextId();
      const item: AppNotification = { id, at: Date.now(), read: false, ...input };

      toast[item.kind](item.title, item.description ? { description: item.description } : undefined);

      set(
        (state) => {
          const items = [item, ...state.items].slice(0, MAX);
          return { items, unreadCount: recomputeUnread(items) };
        },
        false,
        'push'
      );
      return id;
    },

    pushSilent: (input) => {
      const id = nextId();
      const item: AppNotification = { id, at: Date.now(), read: false, ...input };
      set(
        (state) => {
          const items = [item, ...state.items].slice(0, MAX);
          return { items, unreadCount: recomputeUnread(items) };
        },
        false,
        'pushSilent'
      );
      return id;
    },

    markRead: (id) =>
      set(
        (state) => {
          const items = state.items.map((n) => (n.id === id ? { ...n, read: true } : n));
          return { items, unreadCount: recomputeUnread(items) };
        },
        false,
        `markRead(${id})`
      ),

    markAllRead: () =>
      set(
        (state) => ({
          items: state.items.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }),
        false,
        'markAllRead'
      ),

    dismiss: (id) =>
      set(
        (state) => {
          const items = state.items.filter((n) => n.id !== id);
          return { items, unreadCount: recomputeUnread(items) };
        },
        false,
        `dismiss(${id})`
      ),

    clear: () => set({ items: [], unreadCount: 0 }, false, 'clear'),
  })
);

// ----------------------------------------------------------------------

/** Convenience wrapper so services can notify without pulling the hook. */
export const notify = (input: Omit<AppNotification, 'id' | 'at' | 'read'>) =>
  useNotificationsStore.getState().push(input);
