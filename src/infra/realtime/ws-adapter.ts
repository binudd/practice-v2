import { TopicEmitter } from './emitter';

import type { RealtimeStatus, RealtimeAdapter } from './types';

// ----------------------------------------------------------------------

const MAX_BACKOFF_MS = 30_000;

/**
 * Plain WebSocket adapter with exponential-backoff reconnect. Message format
 * is `{ topic: string, payload: any }` as JSON. Swap for socket.io / SSE /
 * Pusher by implementing the same {@link RealtimeAdapter} interface.
 */
export class WsRealtimeAdapter implements RealtimeAdapter {
  private socket: WebSocket | null = null;

  private emitter = new TopicEmitter();

  private statusHandlers = new Set<(s: RealtimeStatus) => void>();

  private _status: RealtimeStatus = 'idle';

  private shouldReconnect = false;

  private attempt = 0;

  constructor(private readonly url: string) {}

  get status(): RealtimeStatus {
    return this._status;
  }

  private setStatus(s: RealtimeStatus) {
    this._status = s;
    this.statusHandlers.forEach((h) => h(s));
  }

  private scheduleReconnect(token?: string) {
    if (!this.shouldReconnect) return;
    this.attempt += 1;
    const delay = Math.min(MAX_BACKOFF_MS, 2 ** this.attempt * 500);
    setTimeout(() => this.connect(token), delay);
  }

  connect(token?: string): Promise<void> {
    this.shouldReconnect = true;
    this.setStatus('connecting');

    const url = token ? `${this.url}?token=${encodeURIComponent(token)}` : this.url;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);
      } catch (err) {
        this.setStatus('error');
        reject(err);
        return;
      }

      this.socket.onopen = () => {
        this.attempt = 0;
        this.setStatus('connected');
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && typeof parsed.topic === 'string') {
            this.emitter.emit({ topic: parsed.topic, payload: parsed.payload });
          }
        } catch (err) {
          console.warn('[ws-realtime] bad message', err);
        }
      };

      this.socket.onclose = () => {
        if (this._status === 'connected') this.setStatus('disconnected');
        this.socket = null;
        this.scheduleReconnect(token);
      };

      this.socket.onerror = () => {
        this.setStatus('error');
      };
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.socket) this.socket.close();
    this.socket = null;
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
