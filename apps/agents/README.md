# Agents

Eve workspace (`@repo/agents`) with product agents **command** and **chat** on one origin: `https://agents.basilic.localhost/eve/command` and `https://agents.basilic.localhost/eve/chat` (same path mounts as a Vercel workspace deploy). Sibling process of Fastify (`apps/api`). Default deploy is a sibling Vercel project (Workflow + Sandbox). Local `eve:dev` / `eve:start` first. This app is excluded from `create-basilic` until a later E PR.

Read bundled docs before changing eve files: `node_modules/eve/docs/README.md`.

## HTTP

Public mounts (Portless locally, one Vercel project in production):

- Command: `https://agents.basilic.localhost/eve/command` — `GET /eve/command/v1/health`
- Chat: `https://agents.basilic.localhost/eve/chat` — `GET /eve/chat/v1/health`

Each eve process still serves `/eve/v1/*` on a loopback port. `scripts/dev-workspace.mjs` (Portless `dev:app`) strips the public prefix. Do not invent `/agents/command` on eve. Do not mount `/eve/` on Fastify. Fastify `GET /agents` (JWT) advertises the public mounts (`EVE_COMMAND_URL`, `EVE_CHAT_URL`).

Channel routes behind each mount:

- `GET …/v1/health` — public `{ ok: true, status: "ready", workflowId }`
- `GET …/v1/info` — route auth
- `POST …/v1/session` — create session
- `POST …/v1/session/:sessionId` — follow-up
- `GET …/v1/session/:sessionId/stream` — NDJSON

Route auth is `basilicAccessJwt()`, `vercelOidc()`, `localDev()`. Access JWT only (`typ=access`). There is no `none()` and no `placeholderAuth()`.

## Sandbox and workflow

`agent/sandbox.ts` uses `defaultBackend()`. Host secrets stay in the app runtime. Sandbox env does not receive `JWT_SECRET`, `DATABASE_URL`, or provider keys.

Local Workflow data is `.eve/.workflow-data` (gitignored). CI does not run live Vercel Workflow.

## Local process

Root `pnpm dev` starts one Portless host after `@repo/db#db:start`. That process spawns command and chat on loopback (`EVE_COMMAND_INTERNAL_PORT` / `EVE_CHAT_INTERNAL_PORT`, defaults 3104 / 3105) and proxies `/eve/command` and `/eve/chat`. Direct unprefixed eve: `pnpm --filter @repo/agents eve:dev:command:app` / `eve:dev:chat:app`. `eve:start` still binds `--port 3004` as a production-like single-member escape hatch. `bootHost` runs from the HTTP channel (once per process — `eve dev` re-evaluates the compiled channel after listen) and applies Drizzle migrations on start. Local default is `PGLITE=false` plus `DATABASE_URL`. A second eval must not construct PGLite: Node 24 V8 aborts (`Check failed: end > addr`) when that WASM is torn down. Both agents set `build.externalDependencies` to `@repo/db`, `@electric-sql/pglite`, and `pg`. Generated projects omit this app.

## pnpm commands

- `pnpm --filter @repo/agents eve:dev` — workspace via Portless (alias of `dev`; also started by root `pnpm dev`)
- `pnpm --filter @repo/agents eve:dev:command:app` — command only, `/eve/v1` (no public prefix)
- `pnpm --filter @repo/agents eve:dev:chat` / `eve:dev:chat:app` — chat only, `/eve/v1`
- `pnpm --filter @repo/agents eve:build` — `eve build`
- `pnpm --filter @repo/agents eve:start` — `eve start --port 3004`
- `pnpm --filter @repo/agents eve:eval` — command `eve eval` (skipIf no language-model key; not default CI)
- `pnpm --filter @repo/agents eve:eval:chat` — chat `eve eval` (skipIf no language-model key; not default CI)
- `pnpm --filter @repo/agents checktypes`
- `pnpm --filter @repo/agents lint:eslint`
- `pnpm --filter @repo/agents test`

Health:

```bash
pnpm --filter @repo/agents eve:dev
curl -sS https://agents.basilic.localhost/eve/command/v1/health
curl -sS https://agents.basilic.localhost/eve/chat/v1/health
```

Session routes need a Fastify access JWT. Optional `ALCHEMY_API_KEY` on this host enables command `get_wallet` / `get_nfts`. Command and chat turns use `getProvider()` (Anthropic → OpenRouter → Ollama). Jev `evaluateBoardTurn` runs first on **command** when Gateway credentials exist; refuse/canned/surface can skip Haiku. Chat does not run Jev. Runtime skill: `agents/command/agent/skills/view-config.md`. Command evals: `agents/command/evals/*.eval.ts`. Chat evals: `agents/chat/evals/*.eval.ts`.

Jev factory: `getEvaluationModel()` is `null` without `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Optional `JEV_MODEL` (default `typesafe-ai/jev`) and `AI_EVALUATE_TIMEOUT_MS`. Unit tests: `pnpm --filter @repo/agents test` (live Gateway is skipped unless `AI_GATEWAY_API_KEY` is set). `eve eval` is not in packages CI.

Architecture: [Eve](https://basilic-docs.vercel.app/docs/architecture/eve). Runtime: [ADR 014](https://basilic-docs.vercel.app/docs/adrs/014-fastify-eve-vercel-runtime). Vercel env: [Vercel Deployment](https://basilic-docs.vercel.app/docs/deployment/vercel).
