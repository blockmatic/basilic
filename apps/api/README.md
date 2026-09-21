# API

Type-safe REST API built with Fastify & OpenAPI. This process is the product API; eve is a sibling host in `apps/agents` (hello only). OpenAPI is the agent contract; there is no product MCP. Routes in `src/routes/` are the source of truth; OpenAPI spec is generated from them. Clients generated via Hey API in `@repo/core`. `GET /` negotiates HTML vs markdown and unknown paths are real 404s. Live OpenAPI is `GET /openapi.json`. Unauthenticated discovery files (`/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/.well-known/api-catalog`, `/.well-known/oauth-protected-resource`) are listed in [API architecture](https://basilic-docs.vercel.app/docs/architecture/api).

## Development

Copy [`.env.defaults.example`](.env.defaults.example) to `.env` and set values (gitignored). Optional `COINGECKO_DEMO_API_KEY` and `MARKETS_CACHE_MS` configure `@repo/markets` (CoinGecko Demo + Binance public REST). Optional `ALCHEMY_API_KEY` configures `@repo/onchain`. JWT `GET /coins` and `POST /coins/query` filter cached `getMarkets` (fixture on vendor 429). JWT watch CRUD is `GET/PUT/DELETE /coins/watches` by asset id. JWT `GET /coins/:assetId/candles` returns Binance klines (fixture when unmapped). JWT `GET /coins/global` and `GET /coins/trending` return CoinGecko global stats and trending (fixture on vendor failure). JWT `GET /account/wallet` returns live Portfolio holdings for the linked `eip155` address. JWT `GET /agents` lists eve command/chat origins. Start database first from the repo root (`pnpm db:start`), then `pnpm dev`. Fastify applies Drizzle migrations on boot in development and seeds identity when empty. `@repo/db` owns schema and the local Supabase CLI (`packages/db/supabase/`). Wipe with **`pnpm reset`**. Uses Supabase CLI for PostgreSQL, or `PGLITE=true` for in-memory. Dev server at [http://localhost:3001](http://localhost:3001). Adopter bar: [Product Ready](../docu/content/docs/testing/product-ready.mdx).

**Switching project_id:** If you change `project_id` in `packages/db/supabase/config.toml` (e.g. after a rebrand), run `pnpm db:stop` before `pnpm db:start`—only one Supabase instance runs per host.

## Vercel

Uses `framework: "fastify"` in vercel.json. Vercel auto-detects `server.ts` as the entrypoint. PostgreSQL migrations run at build time on non-preview deploys (advisory-locked); Preview skips unless `RUN_PG_MIGRATE=true` with an isolated `DATABASE_URL`. PGLite migrations run at runtime.

**OPTIONS Allowlist (CORS preflight):** When Deployment Protection is enabled on preview deployments, add `/` (or `/auth`) to **Project Settings > Deployment Protection > OPTIONS Allowlist**. Otherwise, preflight OPTIONS requests are blocked before reaching Fastify and CORS fails for cross-origin clients.

**Public discovery GETs:** `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/openapi.json`, and `/.well-known/*` must stay reachable without a Vercel login (Is Agentic). Use Standard Protection so the production domain stays public. The OPTIONS allowlist above is CORS preflight only. How: [API host crawl](https://basilic-docs.vercel.app/docs/deployment/vercel#api-host-crawl).

**CI & Builds** (`api-e2e.yml`): Unit tests and E2E run on PR when `apps/api` or its dependencies change. Spawns API locally via `test:e2e:local`; no Vercel deploy required.

## Testing

Copy `.env.test.example` to `.env.test` (gitignored) for unit tests. Vitest loads it when present. See [Testing](https://basilic-docs.vercel.app/docs/testing) for group layout, assertion rules, and catalog contract, and [Error Handling](https://basilic-docs.vercel.app/docs/architecture/error-handling) for RFC 9457 fields and 401/429 headers. `ALLOWED_ORIGINS` controls CORS and URL validation for auth callbacks (default `*` in dev/test; production omit/`*` uses `WEB_APP_URL` origin).

## pnpm commands

- `pnpm dev` — Dev server with hot reload (requires db)
- `pnpm build` — OpenAPI generate + TypeScript compile (copies PGLite SQL into `dist`). PostgreSQL migrate is a separate `pnpm db:migrate` / Vercel phase
- `pnpm start` — Production server
- `pnpm test` — Unit tests (Vitest)
- `pnpm test:e2e` — E2E (expects API URL via env or `--api`)
- `pnpm test:e2e:local` — Spawn API, poll, run E2E, cleanup
- `pnpm test:e2e:ui` — E2E with Playwright UI
- `pnpm test:e2e:debug` — Debug E2E tests
- `pnpm checktypes` — Type-check
- `pnpm db:migrate` — Run migrations (skips when PGLITE=true or Vercel Preview; use `RUN_PG_MIGRATE=true` to force PostgreSQL, including isolated Preview DBs)
- `pnpm reset` — Wipe: `@repo/db` `db:reset`, then Drizzle migrate + `scripts/seed.ts`. From repo root: `pnpm reset`. Daily `pnpm dev` migrates and seeds without this.
- `pnpm db:generate` — Generate migrations from `@repo/db` schema
- `pnpm db:push` — Push schema (dev only)
- `pnpm generate:openapi` — Regenerate OpenAPI spec

**Database:** `@repo/db` owns schema (`packages/db/src/schema/tables/*.ts`), SQL (`packages/db/src/migrations/`), `drizzle.config.ts`, and local Supabase CLI (`packages/db/supabase/`). Api `pnpm db:generate` delegates to `--filter=@repo/db`. `scripts/migrate.ts` is the Vercel/CLI wrapper around `@repo/db/migrate` `runPostgresMigrations`. Development boot uses `runMigrations`. `pnpm reset` wipes then migrate+seed.

## Links

- [Environment setup](https://basilic-docs.vercel.app/docs/development) — Env vars, `DATABASE_URL`, `PGLITE`
- [Deployment](https://basilic-docs.vercel.app/docs/deployment) — Vercel, Cloud Run, ECS
- [Authentication](https://basilic-docs.vercel.app/docs/architecture/authentication) — JWT, magic link, API keys
- [API architecture](https://basilic-docs.vercel.app/docs/architecture/api) — Routes, OpenAPI, clients
- [AI architecture](https://basilic-docs.vercel.app/docs/architecture/ai) — Providers, `/ai/generate`, streaming
- [Database migrations](https://basilic-docs.vercel.app/docs/adrs/008-database) — PostgreSQL vs PGLite
