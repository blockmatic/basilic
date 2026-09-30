# Agents

Eve workspace (`@repo/agents`) with product agent **command**. Canonical docs: [Eve](/docs/architecture/eve). Sibling process of Fastify (`apps/api`). Chat lives in [Coin Tracker](https://github.com/blockmatic/basilic-tracker).

Read bundled docs before changing eve files: `node_modules/eve/docs/README.md`.

## HTTP

Public mount (Portless locally, one Vercel project in production):

- Command: `https://agents.basilic.localhost/eve/command` — `GET /eve/command/v1/health`

Each eve process still serves `/eve/v1/*` on a loopback port. `scripts/dev-workspace.mjs` (Portless `dev:app`) strips the public prefix. Do not invent `/agents/command` on eve. Do not mount `/eve/` on Fastify. Fastify `GET /agents` advertises the public mount (`EVE_COMMAND_URL`).

Channel routes behind the mount:

- `GET …/v1/health` — public `{ ok: true, status: "ready", workflowId }`
- `GET …/v1/info` — route auth
- `POST …/v1/session` — create session
- `POST …/v1/session/:sessionId` — follow-up
- `GET …/v1/session/:sessionId/stream` — NDJSON

Route auth is `basilicAccessJwt()`, anonymous (no Bearer, IP rate limit), `vercelOidc()`, `localDev()`. Access JWT only (`typ=access`). There is no `placeholderAuth()`.

## Sandbox and workflow

`agent/sandbox.ts` uses `defaultBackend()`. Host secrets stay in the app runtime. Sandbox env does not receive `JWT_SECRET`, `POSTGRES_URL`, or provider keys. Command sets `defaultTools: false`, so the model does not get shell, file, or web tools. Command re-exports `load_skill` for `view-config`.

Local Workflow data is `.eve/.workflow-data` (gitignored). CI does not run live Vercel Workflow.

## Local process

Root `pnpm dev` starts one Portless host after `@repo/db#db:start`. That process spawns command on loopback (`EVE_COMMAND_INTERNAL_PORT`, default 3104) and proxies `/eve/command`. Direct unprefixed eve: `pnpm --filter @repo/agents eve:dev:command:app`. `eve:start` still binds `--port 3004` as a production-like single-member escape hatch. `bootHost` runs from the HTTP channel (once per process — `eve dev` re-evaluates the compiled channel after listen) and applies Drizzle migrations on start. Local default is `PGLITE=false` plus `POSTGRES_URL`. A second eval must not construct PGLite: Node 24 V8 aborts (`Check failed: end > addr`) when that WASM is torn down. Generated projects omit this app.

## pnpm commands

- `pnpm --filter @repo/agents eve:dev` — workspace via Portless (alias of `dev`; also started by root `pnpm dev`)
- `pnpm --filter @repo/agents eve:dev:command:app` — command only, `/eve/v1` (no public prefix)
- `pnpm --filter @repo/agents eve:build` — `eve build`
- `pnpm --filter @repo/agents eve:start` — `eve start --port 3004`
- `pnpm --filter @repo/agents eve:eval` — command `eve eval` (skipIf no language-model key; not default CI)
- `pnpm --filter @repo/agents checktypes`
- `pnpm lint`
- `pnpm --filter @repo/agents test` — Pattern B `@repo/utils` `import` is `dist/`. After a new utils subpath, run `pnpm --filter @repo/utils build` first.

Health:

```bash
pnpm --filter @repo/agents eve:dev
curl -sS https://agents.basilic.localhost/eve/command/v1/health
```

Session routes accept a Fastify access JWT or an anonymous principal. Command turns use `getProvider()` (Vercel AI Gateway). Eve does not read Fastify's `apps/api/.env`; set `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` in `apps/agents/.env`. Non-canned command turns fail with "language model is not configured" when those vars are unset. Jev `evaluateBoardTurn` runs first on **command** when Gateway credentials exist; refuse/canned/surface can skip the language model. Runtime skill: `agents/command/agent/skills/view-config.md`. Command evals: `agents/command/evals/*.eval.ts`.

Jev factory: `getEvaluationModel()` is `null` without `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Optional `JEV_MODEL` (default `typesafe-ai/jev`) and `AI_EVALUATE_TIMEOUT_MS`. Unit tests: `pnpm --filter @repo/agents test` (live Jev/Gateway is skipped unless `RUN_JEV_TESTS=1`). `eve eval` is not in packages CI.

Architecture: [Eve](/docs/architecture/eve). Runtime: [ADR 014](/docs/adrs/014-fastify-eve-vercel-runtime). Vercel env: [Vercel Deployment](/docs/deployment/vercel).
