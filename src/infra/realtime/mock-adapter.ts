import { TopicEmitter } from './emitter';

import type { RealtimeStatus, RealtimeAdapter } from './types';

// ----------------------------------------------------------------------

/**
 * In-memory adapter that emits synthetic events on an interval. Useful to
 * develop and test realtime-aware UI without a server. Events fired:
 *   - notification   every 30s
 *   - project.touched every 45s (no-op by default; consumers can hook it)
 */
export class MockRealtimeAdapter implements RealtimeAdapter {
  private emitter = new TopicEmitter();

  private statusHandlers = new Set<(s: RealtimeStatus) => void>();

  private timer: ReturnType<typeof setInterval> | null = null;

  private _status: RealtimeStatus = 'idle';

  get status(): RealtimeStatus {
    return this._status;
  }

  private setStatus(s: RealtimeStatus) {
    this._status = s;
    this.statusHandlers.forEach((h) => h(s));
  }

  async connect(): Promise<void> {
    this.setStatus('connecting');
    await new Promise((r) => setTimeout(r, 250));
    this.setStatus('connected');

    let tick = 0;
    this.timer = setInterval(() => {
      tick += 1;
      if (tick % 3 === 0) {
        this.emitter.emit({
          topic: 'notification',
          payload: {
            kind: 'info',
            title: 'Mock realtime tick',
            description: `Heartbeat #${tick}`,
          },
        });
      }
    }, 10_000);
  }

  disconnect(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.emitter.clear();
    this.setStatus('disconnected');
  }

  subscribe = this.emitter.on.bind(this.emitter);

  onStatus(handler: (s: RealtimeStatus) => void) {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }
}
