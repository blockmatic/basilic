# Integration Testing Strategy (Fastify + pglite)

This document defines how integration tests are structured and executed in `apps/fastify`, given **pglite concurrency constraints**.

---

## Core Constraint

- **pglite does NOT support concurrent writers reliably**
- Vitest runs **test files in parallel by default**
- We must control **worker count** and keep DB lifecycle **worker-scoped**

---

## Vitest Execution Model (Critical)

- **Parallelism happens across test files** (workers), not inside a single file
- `describe()` blocks **do not** create workers
- Imports **do not** create workers
- `beforeAll/afterAll` in `vitest.setup.ts` runs **once per worker**, not per `describe`, not per test

Implication: if you initialize DB/migrations inside each `.spec.ts`, you'll re-run expensive setup **N times** and directly fight the "minimize init/delete" goal.

---

## The Real Problem to Solve

The pglite failures happen when **multiple workers touch the same pglite instance**.

So the fix is **worker count**, not "move setup into each `.spec.ts`".

---

## Recommendation (What We Do)

1. **Keep `vitest.setup.ts`** responsible for DB lifecycle:
   - Run migrations **once per worker**
   - Close/delete the DB **once per worker**
2. Each worker gets its own isolated pglite instance via `vitest.setup.ts`
3. Multiple workers can run in parallel safely since each has isolated database

Net effect: **one DB/migration per worker**, with each worker having isolated pglite instance.

---

## Adopted Pattern: Group Entry + Route-Level Test Modules

### Goal

- Keep tests **collocated per route** alongside route code
- Reuse **one Fastify instance per group**
- Control worker boundaries through Vitest test file discovery
- Multiple workers supported (each worker gets isolated database via `vitest.setup.ts`)

### Folder Structure

Tests are collocated in `src/routes/` alongside route code:

```
src/routes/{domain}/{group}/
  {endpoint}.ts             // route implementation
  {endpoint}.test.ts        // route-level test module (imported)
  {endpoint2}.test.ts
  {group}.spec.ts           // group entrypoint (Vitest-discovered)
```

Examples:

```
src/routes/auth/magiclink/
  request.ts
  request.test.ts
  verify.ts
  verify.test.ts
  magiclink.spec.ts         // group entry

src/routes/ai/
  chat.ts
  chat.test.ts
  ai.spec.ts                // group entry

src/routes/
  health.ts
  health.spec.ts            // single-file route entrypoint
  root.ts
  root.spec.ts              // single-file route entrypoint
```

---

## Responsibility Split

### Worker setup (`vitest.setup.ts`)

- Owns **DB lifecycle** (create/migrate once per worker, close/delete once per worker)

### Group entry (`{group}.spec.ts`)

- Owns **Fastify lifecycle** for that group
- Builds the app **once** in `beforeAll`, reuses it across imported tests
- Exports `fastify` instance for route tests to import
- Imports route-level test modules
- **Does not** run migrations (handled in `vitest.setup.ts`)
- **Does not** close Fastify (worker teardown handles it)

Example:

```ts
// src/routes/auth/magiclink.spec.ts
import { beforeAll } from 'vitest'
import type { TestApp } from '../../../test/utils/fastify.js'
import { buildTestApp } from '../../../test/utils/fastify.js'

let fastify: TestApp

beforeAll(async () => {
  fastify = await buildTestApp()
})

export { fastify }

import './magiclink/request.test'
import './magiclink/verify.test'
```

### Route-level test modules (`{endpoint}.test.ts`)

- Pure test definitions (`describe/it`)
- **No Fastify bootstrapping** (imports `fastify` from group entry)
- **No DB setup/teardown** (handled in `vitest.setup.ts`)
- Uses `beforeEach` for test-specific setup (e.g., clearing email outbox)
- Assumes a shared Fastify instance and DB already exist in the worker

Example:

```ts
// src/routes/auth/magiclink/request.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { fastify } from '../magiclink.spec.js'

describe('POST /auth/magiclink/request', () => {
  beforeEach(() => {
    fastify.fakeEmail.clear()
  })
  
  it('should send magic link email', async () => {
    const response = await fastify.inject({...})
    // assertions
  })
})
```

---

## What to Change in Your Specs

- Stop closing Fastify/DB per test file if your worker setup already does worker teardown
- In each `.spec.ts`, **build Fastify once and reuse it**; let worker teardown handle DB close/delete

---

## Vitest Configuration

**Critical**: Vitest config only discovers `*.spec.ts` files:

```ts
// vitest.config.ts
test: {
  include: ['**/*.spec.ts'],  // Only .spec.ts files are entrypoints
  // ...
}
```

This ensures:
- Only group entry files (`*.spec.ts`) are test entrypoints
- Route-level test files (`*.test.ts`) are imported, not discovered
- Worker boundaries are controlled by `.spec.ts` file discovery
- Each worker gets isolated database via `vitest.setup.ts`

---

## Naming Conventions

- `*.spec.ts` → **test entrypoints / worker boundary**
- `*.test.ts` → **imported test modules**
- Do not mix `.e2e-spec.ts`, `.spec.ts`, `.test.ts` arbitrarily

---

## TL;DR

- `vitest.setup.ts`: **one DB/migration per worker** (beforeAll/afterAll)
- `vitest.config.ts`: **only discovers `*.spec.ts` files** as entrypoints
- `*.spec.ts`: build Fastify once in beforeAll, export instance, import route tests
- `*.test.ts`: pure test definitions, import `fastify` from group entry, use `beforeEach` for test setup
- Tests collocated in `src/routes/` alongside route code
- Multiple workers supported (each worker gets isolated pglite instance)
