# Agents

Eve workspace (`@repo/agents`) with product agents **command** (port **3004**) and **chat** (port **3005**). Sibling process of Fastify (`apps/api`). This app is excluded from `create-basilic` until a later E PR.

Read bundled docs before changing eve files: `node_modules/eve/docs/README.md`.

## HTTP

Each workspace member serves eve 0.63 channel routes on its own origin:

- `GET /eve/v1/health` — public `{ ok: true, status: "ready", workflowId }`
- `GET /eve/v1/info` — route auth
- `POST /eve/v1/session` — create session
- `POST /eve/v1/session/:sessionId` — follow-up
- `GET /eve/v1/session/:sessionId/stream` — NDJSON

Do not invent `/agents/command` on eve. Do not mount `/eve/` on Fastify. Fastify `GET /agents` (JWT) advertises these origins.

Route auth is `basilicAccessJwt()`, `vercelOidc()`, `localDev()`. Access JWT only (`typ=access`). There is no `none()` and no `placeholderAuth()`.

## Sandbox and workflow

`agent/sandbox.ts` uses `defaultBackend()`. Host secrets stay in the app runtime. Sandbox env does not receive `JWT_SECRET`, `DATABASE_URL`, or provider keys.

Local Workflow data is `.eve/.workflow-data` (gitignored). CI does not run live Vercel Workflow.

## Ports

Command binds **3004**. Chat binds **3005**. Root `pnpm dev` does not start eve (no `dev` script).

## pnpm commands

- `pnpm --filter @repo/agents eve:dev` — command on 3004
- `pnpm --filter @repo/agents eve:dev:chat` — chat on 3005
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
curl -sS http://127.0.0.1:3004/eve/v1/health
```

Session routes need a Fastify access JWT. Optional `ALCHEMY_API_KEY` on this host enables command `get_wallet` / `get_nfts`. Command and chat turns use `getProvider()` (Anthropic → OpenRouter → Ollama). Jev `evaluateBoardTurn` runs first on **command** when Gateway credentials exist; refuse/canned/surface can skip Haiku. Chat does not run Jev. Runtime skill: `agents/command/agent/skills/view-config.md`. Command evals: `agents/command/evals/*.eval.ts`. Chat evals: `agents/chat/evals/*.eval.ts`.

Jev factory: `getEvaluationModel()` is `null` without `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Optional `JEV_MODEL` (default `typesafe-ai/jev`) and `AI_EVALUATE_TIMEOUT_MS`. Unit tests: `pnpm --filter @repo/agents test` (live Gateway is skipped unless `AI_GATEWAY_API_KEY` is set). `eve eval` is not in packages CI.

Architecture: [Eve](https://basilic-docs.vercel.app/docs/architecture/eve). Runtime: [ADR 014](https://basilic-docs.vercel.app/docs/adrs/014-fastify-eve-vercel-runtime).
