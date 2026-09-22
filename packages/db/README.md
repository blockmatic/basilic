# @repo/db

Drizzle PostgreSQL schema, client factory, and named data-access functions. Fastify and eve host call this package. Next.js must not import it.

## Exports

| Path | Use for |
|------|--------|
| `@repo/db` | `configureDb`, `getDb`, `closeDb`, `resetDbInstance`, asset/watch/session/account-snapshot/linked-wallet fns (`findBinanceMarket`) |
| `@repo/db/schema` | Table defs for Fastify auth and coins routes |
| `@repo/db/migrate` | `runMigrations`, `runPostgresMigrations`, `migrationsDir` |

Call `configureDb({ databaseUrl, pglite, pgliteInstance })` from the host env; pass `databaseUrl` from `POSTGRES_URL`. The package does not import Fastify `env` or the api test harness.

Local Docker Postgres is `pnpm db:start` (Supabase CLI in this package; no-op when `SKIP_DB_START=1`). `dev` is `tsc --watch` so Fastify and eve pick up `dist/` changes. Identity seed stays in `apps/api`.

## Scripts

- `pnpm --filter @repo/db build` — Compile and copy SQL migrations
- `pnpm --filter @repo/db dev` — `tsc --watch`
- `pnpm db:start` / `db:stop` / `db:status` — Supabase CLI (from repo root: `pnpm db:start`)
- `pnpm --filter @repo/db db:reset` — `supabase db reset` (wipe only; used by `pnpm reset`)
- `pnpm --filter @repo/db checktypes` — Type-check
- `pnpm --filter @repo/db test` — PGLite unit tests
- `pnpm --filter @repo/db db:generate` — Generate migrations from schema
