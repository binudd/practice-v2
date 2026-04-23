# Domain layer

Pure, framework-free models, rules and selectors for each business concept.

## Layout

```
domain/
  <feature>/
    <feature>.ts           entity type + zod schema + parsers
    <feature>-policy.ts    access rules (who can do what)
    <feature>-selectors.ts pure derivations (progress, overdue, etc.)
    index.ts               barrel re-export
```

## Rules

- No React, no `src/components/*` imports, no axios imports.
- Schemas are the contract with the backend: every action fetcher should
  pass the response through `parseXyz(...)` so invalid shapes fail loudly in
  dev (`safeParse` -> log in dev, empty value in prod).
- Policies receive the whole `AuthUser` and optional subject; they return a
  boolean. Compose, do not branch on roles inside components.
- Selectors are pure - they must not call hooks or touch network/state.

## When to add a new domain module

You are about to touch a feature that currently keeps its type in
`src/types/*` and its permissions inline? Promote it:

1. Move the type to `src/domain/<feature>/<feature>.ts` with a zod schema.
2. Keep the `src/types/<feature>.ts` file as a compatibility re-export to
   avoid a large rename.
3. Add a policy file. Replace inline `if (user.role === 'admin')` checks in
   views with `<Can policy={Policy.canX} subject={obj}>`.
4. If the feature is fetched by SWR, have the action call `parseXyz(...)`
   before handing data to the UI.
5. Optionally add a `src/infra/api/<feature>-api.ts` adapter if the action
   currently talks to axios directly.
