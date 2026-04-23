# Client state (Zustand)

Stores live here and own **client-side UI state** only. Server/remote data stays
in SWR; form state stays in React Hook Form; theme and auth stay in their
Contexts.

## When to use a Zustand store

Reach for a store when any of these apply:

- State must be shared across unrelated components or routes.
- State must survive a navigation (but is not server data).
- A non-React module (a service, an adapter, tests) needs to read or write it.
- Prop-drilling more than two levels to synchronise a toggle.

If none of those apply, use `useState` or one of the existing hooks
(`useBoolean`, `useSetState`, etc).

Anti-patterns:

- Do not duplicate server state. `actions/*.ts` already cache it via SWR; use
  `mutate()` for writes.
- Do not put form field values in a store - React Hook Form owns those.
- Do not keep large data sets in `persist`ed stores; only user-level preferences.

## Pattern

Each store lives in its own file and exports:

- `useXyzStore` - the React hook.
- Selectors (for stable references) colocated in the same file, e.g.
  `selectScreenFilter`.

Use the helpers in [`create.ts`](./create.ts):

```ts
import { createStore, createPersistedStore } from './create';

export const useFooStore = createStore<FooState>('foo', (set) => ({ ... }));
// or
export const useBarStore = createPersistedStore<BarState>(
  'bar',
  (set) => ({ ... }),
  { name: 'bar', storage: 'local', version: 1, partialize: (s) => ({ ... }) },
);
```

Both helpers enable Redux DevTools in development. `createPersistedStore`
prefixes the storage key with `pms:` and accepts `storage: 'local' | 'session'`.

## Reading from a store

Always select a narrow slice. Selecting the whole state is legal but costs
re-renders.

```ts
const viewMode = useUIPreferencesStore((s) => s.viewMode['project.list']);
```

For multi-key reads where stable references matter, compose selectors or use
`useShallow` (`zustand/react/shallow`).

## Writing outside React

Services in [`src/services/`](../services/) and adapters in
[`src/infra/`](../infra/) must not import hooks. Read/write via the vanilla API:

```ts
import { useNotificationsStore } from 'src/store';

useNotificationsStore.getState().push({ kind: 'success', title: 'Saved' });
```

## Available stores

| Store                  | Scope        | Persisted   | Purpose                                       |
| ---------------------- | ------------ | ----------- | --------------------------------------------- |
| `useUIPreferencesStore`| App-wide     | localStorage| View modes per screen, sidebar mini, recents  |
| `useFiltersStore`      | App-wide     | No          | Per-screen search/status/date filter bags     |
| `useDevStore`          | App-wide     | sessionStorage | Dev-only role override (no-op in prod)     |
| `useNotificationsStore`| App-wide     | No          | Toast queue + unread history                  |

## Adding a new store

1. Create `src/store/<name>-store.ts` and export `useXyzStore` + a `XyzState` type.
2. Re-export from [`src/store/index.ts`](./index.ts).
3. Add a row to the table above.
4. If persisted, bump the `version` and add a migration when the shape changes.
