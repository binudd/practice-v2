
import { useRef, useState, useEffect } from 'react';

import { CONFIG } from 'src/config-global';

import { WsRealtimeAdapter } from './ws-adapter';
import { registerDefaultHandlers } from './registry';
import { MockRealtimeAdapter } from './mock-adapter';

import type { RealtimeStatus, RealtimeHandler, RealtimeAdapter } from './types';

// ----------------------------------------------------------------------

/**
 * Single shared adapter instance for the whole app. Created lazily on first
 * connect and reused across tabs/unmounts. This avoids multiple WebSocket
 * connections when many hooks use `useRealtime`.
 */
let _adapter: RealtimeAdapter | null = null;

function getAdapter(): RealtimeAdapter | null {
  if (_adapter) return _adapter;
  switch (CONFIG.realtime.driver) {
    case 'mock':
      _adapter = new MockRealtimeAdapter();
      return _adapter;
    case 'ws':
      if (!CONFIG.realtime.url) return null;
      _adapter = new WsRealtimeAdapter(CONFIG.realtime.url);
      return _adapter;
    default:
      return null;
  }
}

// ----------------------------------------------------------------------

type UseRealtimeOptions = {
  /** Access token passed to the adapter when connecting (WS only). */
  token?: string;
  /** Turn the connection on/off without unmounting the hook. */
  enabled?: boolean;
};

export function useRealtime({ token, enabled = true }: UseRealtimeOptions = {}) {
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const registeredRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const adapter = getAdapter();
    if (!adapter) return undefined;

    const unsubStatus = adapter.onStatus(setStatus);
    registeredRef.current?.();
    registeredRef.current = registerDefaultHandlers(adapter);

    adapter.connect(token).catch((err) => console.warn('[realtime] connect failed', err));

    return () => {
      registeredRef.current?.();
      registeredRef.current = null;
      unsubStatus();
      // Keep the adapter alive across mounts; only disconnect on sign-out which
      // callers trigger explicitly via the exported helper below.
    };
  }, [enabled, token]);

  return { status, connected: status === 'connected', adapter: getAdapter() };
}

// ----------------------------------------------------------------------

/** Subscribe to a single realtime topic for the lifetime of a component. */
export function useRealtimeTopic<T = unknown>(topic: string, handler: RealtimeHandler<T>) {
  useEffect(() => {
    const adapter = getAdapter();
    if (!adapter) return undefined;
    return adapter.subscribe<T>(topic, handler);
  }, [topic, handler]);
}

// ----------------------------------------------------------------------

export function disconnectRealtime() {
  if (_adapter) {
    _adapter.disconnect();
    _adapter = null;
  }
}
