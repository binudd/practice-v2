import type { Unsubscribe, RealtimeEvent, RealtimeHandler } from './types';

// ----------------------------------------------------------------------

/** Tiny topic/handler map used internally by both adapters. */
export class TopicEmitter {
  private handlers = new Map<string, Set<RealtimeHandler>>();

  on<T>(topic: string, handler: RealtimeHandler<T>): Unsubscribe {
    let set = this.handlers.get(topic);
    if (!set) {
      set = new Set();
      this.handlers.set(topic, set);
    }
    set.add(handler as RealtimeHandler);
    return () => {
      set!.delete(handler as RealtimeHandler);
      if (set!.size === 0) this.handlers.delete(topic);
    };
  }

  emit<T>(event: RealtimeEvent<T>) {
    const exact = this.handlers.get(event.topic);
    if (exact) exact.forEach((h: RealtimeHandler) => h(event));

    // Support wildcard topics: 'project.*' matches 'project.updated'.
    this.handlers.forEach((set, registered) => {
      if (!registered.endsWith('.*')) return;
      const prefix = registered.slice(0, -1);
      if (event.topic.startsWith(prefix)) set.forEach((h: RealtimeHandler) => h(event));
    });
  }

  clear() {
    this.handlers.clear();
  }
}
