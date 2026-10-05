# Agents

Eve workspace (`@repo/agents`) with public agents **operator** and **ask**. Canonical docs: [Agents](/docs/architecture/agents) and [Eve](/docs/architecture/eve). Sibling process of Fastify (`apps/api`). Coin Tracker mounts the same ids with a board-specific operator tool surface.

Read bundled docs before changing eve files: `node_modules/eve/docs/README.md`.

## HTTP

Public mounts (Portless locally, one Vercel project in production):

- Operator: `https://agents.basilic.localhost/eve/operator` — `GET /eve/operator/v1/health`
- Ask: `https://agents.basilic.localhost/eve/ask` — `GET /eve/ask/v1/health`

Each eve process still serves `/eve/v1/*` on a loopback port. `scripts/dev-workspace.mjs` (Portless `dev:app`) strips the public prefix. Fastify `GET /agents` advertises `${EVE_AGENTS_URL}/eve/<id>`.

## Models

Language models use `ANTHROPIC_API_KEY` in `apps/agents/.env` (Haiku default: `claude-haiku-4-5`). Jev (`typesafe-ai/jev`) uses `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` on the eve host only. Eve does not read Fastify `apps/api/.env`.

`AGENTS_MODEL=scripted` runs deterministic routers without keys. `AGENTS_MODEL=anthropic` requires `ANTHROPIC_API_KEY`.

## pnpm commands

- `pnpm --filter @repo/agents eve:dev` — workspace via Portless (also started by root `pnpm dev`)
- `pnpm --filter @repo/agents eve:dev:command:app` — operator only, `/eve/v1` (no public prefix)
- `pnpm --filter @repo/agents test` — unit tests; live Gateway Jev needs a real `AI_GATEWAY_API_KEY`

Architecture: [Agents](/docs/architecture/agents). Runtime: [ADR 014](/docs/adrs/014-fastify-eve-vercel-runtime).
