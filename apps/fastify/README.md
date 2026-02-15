# API

Type-safe REST API built with Fastify & OpenAPI. Routes in `src/routes/` are the source of truth; OpenAPI spec is generated from them. Clients generated via Hey API in `@repo/core`.

## Development

Start database first (`pnpm db:start`), then `pnpm dev`. Uses Supabase CLI for PostgreSQL, or `PGLITE=true` for in-memory. Dev server at [http://localhost:3000](http://localhost:3000).

## Vercel

Uses `framework: "fastify"` in vercel.json. Vercel auto-detects `server.ts` as the entrypoint. PostgreSQL migrations run at build time; PGLite migrations run at runtime.

**OPTIONS Allowlist (CORS preflight):** When Deployment Protection is enabled on preview deployments, add `/` (or `/auth`) to **Project Settings > Deployment Protection > OPTIONS Allowlist**. Otherwise, preflight OPTIONS requests are blocked before reaching Fastify and CORS fails for cross-origin clients.

**CI & Builds:** Unit tests run on PR when `apps/fastify` or its dependencies change. E2E runs after Vercel deployment succeeds; project name must contain `basilic-fastify`.

## Testing

Copy `.env.test.example` to `.env.test` (gitignored) for unit tests. Vitest loads it when present.

## pnpm commands

- `pnpm dev` — Dev server with hot reload (requires db)
- `pnpm build` — Migrations + TypeScript build
- `pnpm start` — Production server
- `pnpm test` — Unit tests (Vitest)
- `pnpm test:e2e` — E2E (expects API URL via env or `--api`)
- `pnpm test:e2e:local` — Spawn API, poll, run E2E, cleanup
- `pnpm test:e2e:ui` — E2E with Playwright UI
- `pnpm test:e2e:debug` — Debug E2E tests
- `pnpm checktypes` — Type-check
- `pnpm db:start` — Start Supabase (local)
- `pnpm db:stop` — Stop Supabase
- `pnpm db:reset` — Reset Supabase database (recreates from scratch)
- `pnpm db:reset-and-migrate` — Reset DB then run Drizzle migrations
- `pnpm db:migrate` — Run migrations (skips when PGLITE=true; use `RUN_PG_MIGRATE=true` to force PostgreSQL)
- `pnpm db:generate` — Generate migrations from schema
- `pnpm db:push` — Push schema (dev only)
- `pnpm generate:openapi` — Regenerate OpenAPI spec

## Links

- [Environment setup](https://basilic-docs.vercel.app/docs/development) — Env vars, `DATABASE_URL`, `PGLITE`
- [Deployment](https://basilic-docs.vercel.app/docs/deployment) — Vercel, Cloud Run, ECS
- [Authentication](https://basilic-docs.vercel.app/docs/architecture/authentication) — JWT, magic link, API keys
- [API architecture](https://basilic-docs.vercel.app/docs/architecture/api) — Routes, OpenAPI, clients
- [Database migrations](https://basilic-docs.vercel.app/docs/adrs/008-database) — PostgreSQL vs PGLite
