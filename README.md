# Basilic

**API-first foundation for agentic products.**

Define capabilities on one HTTP API. Web, CLI, generated clients, coding agents, and durable eve agents consume that contract. Generative UI is tooling: Jev triages command turns, json-render specs are composed on Next, and shadcn/Base UI (`@repo/ui`) is the catalog. There is no product MCP.

[Docs](https://basilic-docs.vercel.app/docs) · [Getting Started](https://basilic-docs.vercel.app/docs/development) · [Architecture](https://basilic-docs.vercel.app/docs/architecture)

## Capabilities

Same set as the docs homepage. Detail lives in [Architecture](https://basilic-docs.vercel.app/docs/architecture).

**Product contract**

- **Product API** — Fastify REST, generated OpenAPI, `/llms.txt`, RFC 9727 catalog
- **Multi-client auth** — session JWT, API keys, OAuth/passkey/magic, SIWE/SIWS
- **Generated clients** — `@repo/core` from the spec; `@repo/react` hooks

**Agentic surfaces**

- **Durable agents** — eve `command` and `chat` in `apps/agents` (clone this repo; omitted from `create-basilic`)
- **Generative UI** — Jev + json-render + shadcn/Base UI
- **API CLI** — `basilic` for humans, scripts, and shell agents; API key; JSON stdout
- **Coding-agent contract** — `AGENTS.md`, Basilic `/w-*`, lock-installed skills

**Human clients**

- **Web** — Next.js on the API; host for Generative UI
- **Mobile** — Expo UI scaffold; not an API client yet
- **End-to-end TypeScript** — schema → OpenAPI → clients

**How you ship**

- **Deploy** — Vercel + Supabase default; Fastify `listen` / `eve start` exit
- **Quality and security** — Biome, Gitleaks, OSV, DeepSec
- **Multichain** — SIWE/SIWS, wallet modal, Alchemy reads (not send/swap)

## How it fits

Fastify is the scored product API. eve is a sibling host for durable turns. Next.js is a typed client; it does not own the API. Agents discover HTTP (`/openapi.json`, `/llms.txt`, RFC 9727). Diagram and capability table: [Architecture](https://basilic-docs.vercel.app/docs/architecture).

## Quick start

Clone this repository for the full reference, including `apps/agents`.

```bash
git clone https://github.com/blockmatic/basilic.git
cd basilic
pnpm setup
pnpm db:start
pnpm dev
```

Requires Node.js 24.x and pnpm 12.5.1. `pnpm setup` does not start Postgres. Named HTTPS hosts: [Dev environments](https://basilic-docs.vercel.app/docs/development/dev-environments). Root scripts: [Development tooling](https://basilic-docs.vercel.app/docs/development/dev-tooling).

The project starter is `npx create-basilic@latest` when published. It is not on npm `latest` yet (`0.0.0` in tree) and omits `apps/agents`. Fork this repository to contribute.

## Tree

**Apps**

- **[API](apps/api/README.md)** — Fastify OpenAPI product API
- **[Web](apps/web/README.md)** — Next.js client on `@repo/core`
- **[Mobile](apps/mobile/README.md)** — Expo UI scaffold (not an API client yet)
- **[Agents](apps/agents/README.md)** — eve `command` and `chat`
- **[Documentation](apps/docu/README.md)** — Fumadocs site

**Packages**

- **[@repo/core](packages/core/README.md)** — generated API client
- **[@repo/cli](packages/cli/README.md)** — API CLI (`basilic`)
- **[@repo/react](packages/react/README.md)** — React Query hooks
- **[@repo/ui](packages/ui/README.md)** — shadcn/Base UI catalog
- **[@repo/utils](packages/utils/README.md)** — shared utilities
- **[@repo/error](packages/error/README.md)** — error reporting
- **[@repo/email](packages/email/README.md)** — React Email templates
- **[@repo/db](packages/db/README.md)** — Drizzle schema and data access

## Documentation

- [Getting Started](https://basilic-docs.vercel.app/docs/development)
- [Contributing](CONTRIBUTING.md)
- [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready)
- [After fork](https://basilic-docs.vercel.app/docs/development/after-fork)
- [AI workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)
- Visual: [`DESIGN.md`](DESIGN.md)

MIT licensed.
