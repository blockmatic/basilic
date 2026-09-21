# @repo/db

Drizzle PostgreSQL schema, client factory, and named data-access functions. Fastify and (later) eve host call this package. Next.js must not import it.

## Exports

| Path | Use for |
|------|--------|
| `@repo/db` | `configureDb`, `getDb`, `closeDb`, `resetDbInstance`, asset/watch/session/account-snapshot/linked-wallet fns (`findBinanceMarket`) |
| `@repo/db/schema` | Table defs for Fastify auth and coins routes |
| `@repo/db/migrate` | `runMigrations`, `migrationsDir` |

Call `configureDb({ databaseUrl, pglite, pgliteInstance })` from the host env. The package does not import Fastify `env` or the api test harness.

## Scripts

- `pnpm --filter @repo/db build` — Compile and copy SQL migrations
- `pnpm --filter @repo/db checktypes` — Type-check
- `pnpm --filter @repo/db test` — PGLite unit tests
- `pnpm --filter @repo/db db:generate` — Generate migrations from schema
