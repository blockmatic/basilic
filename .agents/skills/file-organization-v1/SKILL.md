---
name: file-organization-v1
description: Folder-plus-index grouping for related modules — when to use folders, index.ts, named entries, and what to avoid (mega-barrels, basename collisions). Use when creating, reviewing, or migrating module layout in TypeScript monorepos.
---

# Skill: file-organization

## Scope

- Applies to: grouping related implementation files in apps and packages, `index.ts` public APIs, import paths, folder naming
- Does NOT cover: Next.js lucide-style package import optimization, Fastify route structure, or Drizzle schema design

## Assumptions

- TypeScript ESM with `.js` extensions in import specifiers
- Kebab-case directory names
- App-local group indexes use **named** re-exports; package subpaths may use `export *` when the folder is a published module boundary

## Principles

- A folder groups **2+ implementation files** of one concern
- `index.ts` is the group's public API when all exports share a runtime
- Drop the folder-name prefix inside the folder (`oauth-google.ts` → `oauth/google.ts`)
- Outside the folder, import the group (`.../feature/index.js`); inside, import siblings directly
- Single-file modules stay files; tests colocate beside implementation
- Mixed runtimes → folder with named entry files, no unifying index

## Constraints

### MUST

- Use kebab-case folder names
- Use named re-exports in app-local group indexes (avoid `export *` mega-barrels)
- Resolve basename collisions before creating a folder (`auth.ts` vs `auth/`)

### MUST NOT

- Add parent mega-barrels (`lib/index.ts`, `components/ui/index.ts`)
- Create `foo/foo.ts` plus a thin re-export index
- Add `index.ts` in Fastify autoload trees (`routes/`, `plugins/`)
- Unify server and client modules in one index when they use different runtimes

### SHOULD

- Keep group indexes small and cohesive (one feature domain)
- Use named entry files when re-exporting would create import cycles
- Prefer existing package subpaths over new root barrels

## Interactions

- Complements [next-v16](../next-v16/SKILL.md) (barrel import optimization ≠ feature group indexes)
- Complements [typescript-v6](../typescript-v6/SKILL.md) (ESM paths, named exports)
- Repo rules override this skill when they specify exceptions (catalogs mapper, Drizzle schema index)

## Patterns

### Group index (same runtime)

```text
oauth/
  shared.ts
  google.ts
  index.ts    # named re-exports only
```

Consumers: `import { getOAuthAllowedCallbackUrls } from '../lib/oauth/index.js'`

### Split runtime (no unifying index)

```text
logger/
  server.ts
  client.ts
  # no index.ts
```

Consumers import named entry files directly (`logger/server`, `logger/client`).

### Named entry (cycle avoidance)

```text
catalogs/
  index.ts      # dictionaries only
  mapper.ts     # imports from ./index.js — not re-exported
```

## Anti-patterns

| Pattern | Why |
| --- | --- |
| Prefix soup at one level | Hard to navigate; use folders |
| `lib/index.ts` re-exporting everything | Mega-barrel; slows builds and obscures boundaries |
| `auth.ts` beside `auth/` | Module resolution footgun |
| Unifying index with `cookies` + `document` | Breaks server/client boundaries |
