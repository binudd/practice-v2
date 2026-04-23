import type { StateCreator } from 'zustand';
import type { PersistOptions } from 'zustand/middleware';

// eslint-disable-next-line import/no-extraneous-dependencies
import { create } from 'zustand';
// eslint-disable-next-line import/no-extraneous-dependencies
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

// ----------------------------------------------------------------------

type PersistConfig<T> = {
  /** Storage key, will be prefixed with `pms:` automatically. */
  name: string;
  /** Where to keep the persisted data. Defaults to localStorage. */
  storage?: 'local' | 'session';
  /** Optional whitelist of keys to persist. Persists the whole state when omitted. */
  partialize?: (state: T) => Partial<T>;
  /** Version for `persist` migrations. */
  version?: number;
};

// ----------------------------------------------------------------------

/**
 * Thin wrapper around `zustand.create` that opts us into Redux DevTools in
 * development and (optionally) `persist`. Everything else is stock Zustand so
 * the API on the returned hook is unchanged.
 */
export function createStore<T extends object>(
  devtoolsName: string,
  initializer: StateCreator<T, [['zustand/devtools', never]], [], T>
) {
  return create<T>()(
    devtools(initializer, { name: `pms:${devtoolsName}`, enabled: import.meta.env.DEV })
  );
}

export function createPersistedStore<T extends object>(
  devtoolsName: string,
  initializer: StateCreator<
    T,
    [['zustand/devtools', never], ['zustand/persist', unknown]],
    [],
    T
  >,
  config: PersistConfig<T>
) {
  const persistOptions: PersistOptions<T, Partial<T>> = {
    name: `pms:${config.name}`,
    storage: createJSONStorage(() =>
      config.storage === 'session' ? window.sessionStorage : window.localStorage
    ) as PersistOptions<T, Partial<T>>['storage'],
    partialize: config.partialize as PersistOptions<T, Partial<T>>['partialize'],
    version: config.version ?? 0,
  };

  return create<T>()(
    devtools(persist(initializer, persistOptions), {
      name: `pms:${devtoolsName}`,
      enabled: import.meta.env.DEV,
    })
  );
}
