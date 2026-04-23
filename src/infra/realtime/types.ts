export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export type RealtimeEvent<T = unknown> = {
  topic: string;
  payload: T;
};

export type RealtimeHandler<T = unknown> = (event: RealtimeEvent<T>) => void;

export type Unsubscribe = () => void;

export interface RealtimeAdapter {
  readonly status: RealtimeStatus;
  connect(token?: string): Promise<void>;
  disconnect(): void;
  subscribe<T = unknown>(topic: string, handler: RealtimeHandler<T>): Unsubscribe;
  onStatus(handler: (status: RealtimeStatus) => void): Unsubscribe;
}
