# API

Type-safe REST API built with Fastify & OpenAPI. Routes in `src/routes/` are the source of truth; OpenAPI spec is generated from them. Clients generated via Hey API in `@repo/core`.

## Development

Copy [`.env.defaults.example`](.env.defaults.example) to `.env` and set values (gitignored). Start database first (`pnpm db:start`), then `pnpm dev`. Uses Supabase CLI for PostgreSQL, or `PGLITE=true` for in-memory. Dev server at [http://localhost:3000](http://localhost:3000).

**Switching project_id:** If you change `project_id` in `supabase/config.toml` (e.g. after a rebrand), run `pnpm db:stop` before `pnpm db:start`—only one Supabase instance runs per host.

## Vercel

Uses `framework: "fastify"` in vercel.json. Vercel auto-detects `server.ts` as the entrypoint. PostgreSQL migrations run at build time on non-preview deploys (advisory-locked); Preview skips unless `RUN_PG_MIGRATE=true` with an isolated `DATABASE_URL`. PGLite migrations run at runtime.

**OPTIONS Allowlist (CORS preflight):** When Deployment Protection is enabled on preview deployments, add `/` (or `/auth`) to **Project Settings > Deployment Protection > OPTIONS Allowlist**. Otherwise, preflight OPTIONS requests are blocked before reaching Fastify and CORS fails for cross-origin clients.

**CI & Builds** (`api-e2e.yml`): Unit tests and E2E run on PR when `apps/api` or its dependencies change. Spawns API locally via `test:e2e:local`; no Vercel deploy required.

## Testing

Copy `.env.test.example` to `.env.test` (gitignored) for unit tests. Vitest loads it when present. See [Testing](https://basilic-docs.vercel.app/docs/testing) for group layout, assertion rules, and catalog contract. `ALLOWED_ORIGINS` controls CORS and URL validation for auth callbacks (default `*` in dev/test; production requires explicit origins, not `*`).

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
- `pnpm db:stop` — Stop Supabase (run before switching to another project’s Supabase)
- `pnpm reset` — From repo root: `pnpm --filter @repo/api reset`. From `apps/api`: Supabase DB reset, then Drizzle migrations (`scripts/migrate.ts`), then seed (`scripts/seed.ts`) with local `DATABASE_URL` + `RUN_PG_MIGRATE=true`. `[db.seed]` / `seed.sql` unused (`supabase/config.toml`)
- `pnpm db:migrate` — Run migrations (skips when PGLITE=true or Vercel Preview; use `RUN_PG_MIGRATE=true` to force PostgreSQL, including isolated Preview DBs)
- `pnpm db:generate` — Generate migrations from schema
- `pnpm db:push` — Push schema (dev only)
- `pnpm generate:openapi` — Regenerate OpenAPI spec

**Database:** `drizzle.config.ts` defines schema glob (`src/db/schema/tables/*.ts`) and migration output (`src/db/migrations`). `scripts/migrate.ts` runs the Drizzle migrator against PostgreSQL (or skips at build time when using PGLite—see `src/db/migrate.ts` at runtime). `pnpm reset` runs `scripts/seed.ts` (`runSeed`) after migrations; `pnpm db:migrate` alone does not.

## Links

- [Environment setup](https://basilic-docs.vercel.app/docs/development) — Env vars, `DATABASE_URL`, `PGLITE`
- [Deployment](https://basilic-docs.vercel.app/docs/deployment) — Vercel, Cloud Run, ECS
- [Authentication](https://basilic-docs.vercel.app/docs/architecture/authentication) — JWT, magic link, API keys
- [API architecture](https://basilic-docs.vercel.app/docs/architecture/api) — Routes, OpenAPI, clients
- [AI architecture](https://basilic-docs.vercel.app/docs/architecture/ai) — Providers, `/ai/*`, streaming, tools
- [Database migrations](https://basilic-docs.vercel.app/docs/adrs/008-database) — PostgreSQL vs PGLite
