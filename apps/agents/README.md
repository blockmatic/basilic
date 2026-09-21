# Agents

Hello-only eve workspace (`@repo/agents`). Sibling process of Fastify (`apps/api`). Product agents `command` and `chat` are E2. This app is excluded from `create-basilic` until a later E PR.

Read bundled docs before changing eve files: `node_modules/eve/docs/README.md`.

## HTTP

eve 0.63 default channel (`agent/channels/eve.ts`):

- `GET /eve/v1/health` — public `{ ok: true, status: "ready", workflowId }`
- `GET /eve/v1/info` — route auth
- `POST /eve/v1/session` — create session (optional first message)
- `POST /eve/v1/session/:sessionId` — follow-up
- `GET /eve/v1/session/:sessionId/stream` — NDJSON
- session controls: `cancel`, `clear`, `compact`, `reset`

Do not invent `/agents/command`. Do not mount `/eve/` on Fastify.

Route auth is `vercelOidc()`, `localDev()`, `placeholderAuth()`. Production browser traffic is rejected until E2 JWT. There is no `none()`.

## Sandbox and workflow

`agent/sandbox.ts` uses `defaultBackend()`: Vercel Sandbox only when `VERCEL` is set; otherwise Docker → microsandbox → just-bash. Host secrets stay in the app runtime. Sandbox env does not receive `JWT_SECRET`, `DATABASE_URL`, or provider keys.

Local Workflow data is `.eve/.workflow-data` (gitignored). CI does not run live Vercel Workflow.

## Ports

`eve start` defaults to `$PORT` then **3000** (collides with Next). `eve dev` defaults to `$PORT` then **2000**. This app binds **3004**.

Root `pnpm dev` does not start eve (no `dev` script). Use the filter below.

## pnpm commands

- `pnpm --filter @repo/agents eve:dev` — `eve dev --port 3004 --no-ui`
- `pnpm --filter @repo/agents eve:build` — `eve build` → `.output/`
- `pnpm --filter @repo/agents eve:start` — `eve start --port 3004`
- `pnpm --filter @repo/agents checktypes`
- `pnpm --filter @repo/agents lint:eslint`

Health:

```bash
pnpm --filter @repo/agents eve:dev
curl -sS http://127.0.0.1:3004/eve/v1/health
```

One turn needs a model credential (`AI_GATEWAY_API_KEY`, Vercel OIDC, or a provider key). Without one, skip `eve invoke` and treat health 200 as the hello check.

Architecture: [Eve](https://basilic-docs.vercel.app/docs/architecture/eve). Runtime: [ADR 014](https://basilic-docs.vercel.app/docs/adrs/014-fastify-eve-vercel-runtime).
