# Basilic: Vercel-oriented agentic product foundation

Own the API. Hang web, mobile, and coding agents off it.

Opinionated TypeScript monorepo for Vercel-oriented workflows: a Fastify API agents can discover (OpenAPI, `llms.txt`), eve for durable command and chat, Next.js as a client. The in-box sample is a coin tracker. Default host is Vercel; exit is ordinary Node (`listen` / `eve start`). Agents read `AGENTS.md` and the spec — the same surface you ship.

**Start a product** (when published): `npx create-basilic@latest my-app`. The npm package is not on `latest` yet — use this repository with `pnpm setup` to run the full reference (including `apps/agents`).

Fork this repository to contribute. [Docs](https://basilic-docs.vercel.app/docs)

## Features

- 🤖 **Agent contract** — `AGENTS.md`, Basilic `/w-*` (`/w-plan` `/w-grill` `/w-wayfinder` `/w-build` `/w-ship`), stack skills in git, and CodeRabbit. Any coding agent or IDE that can read those files.
- 📐 **Conventions** — Glob Cursor rules as adapters, `@repo/error`, Pino logging, shared TypeScript and style.
- 🔌 **OpenAPI and auth** — Fastify REST, Swagger UI, JWT and API key auth for all clients.
- 📦 **SDK generation** — Type-safe clients from OpenAPI via HeyAPI.
- 🧑‍💻 **TypeScript-first** — End-to-end types from database to frontend.
- 🧩 **Web and mobile on the API** — Next.js coin tracker, React hooks, Expo UI scaffold, Fastify API (not a signer or OpenAI template).
- 🎨 **Turbo monorepo + design system** — ShadcnUI components with shared utilities.
- 🚀 **Vercel by default, portable** — Shipped path is Vercel + Supabase; ordinary Node, HTTP, and Postgres if you leave.
- ⚙️ **Preconfigured dev tools** — Biome, Git workflows, hooks, and security checks.
- 🛡️ **Security built in** — Automated checks in CI (Gitleaks, OSV, DeepSec).
- ⛓️ **Multichain (API)** — EVM and Solana SIWE/SIWS on Fastify; shared `@repo/utils/web3` helpers — not a web wallet demo.

## Technology stack

- **AI (in-app):** AI SDK — Anthropic, OpenRouter, Ollama (no first-class OpenAI SDK)
- **Frontend:** Next.js 16, React 19, Tailwind, ShadcnUI
- **Backend:** Fastify, PostgreSQL, Supabase
- **Web3:** Fastify SIWE/SIWS + `@repo/utils/web3`. Web has a custom wallet modal (wagmi + Wallet Standard), not RainbowKit. Not send/swap.
- **DevOps:** Node.js 24.x (LTS Krypton), pnpm, TurboRepo, TypeScript, Biome, ESLint

## Apps

- **[API](apps/api/README.md)** — Type-safe REST API built with Fastify & OpenAPI
- **[Web App](apps/web/README.md)** — Next.js coin tracker sample
- **[Mobile App](apps/mobile/README.md)** — Expo UI scaffold (shared `@repo/ui`; not an API client yet)
- **[Documentation](apps/docu/README.md)** — Fumadocs site (architecture, ADRs, development)

## Packages

- **[@repo/core](packages/core/README.md)** — Runtime-agnostic API client and types generated from OpenAPI specs
- **[@repo/cli](packages/cli/README.md)** — TypeScript CLI for API (API key auth; ideal for agentic integrations)
- **[@repo/react](packages/react/README.md)** — React Query hooks for `@repo/core` API functions
- **[@repo/ui](packages/ui/README.md)** — Shared UI component library (Shadcn/ui, Tailwind)
- **[@repo/utils](packages/utils/README.md)** — Shared utilities (async, data, debug, error, logger, web3)
- **[@repo/error](packages/error/README.md)** — Error reporting and utilities (`captureError`, `getErrorMessage`)
- **[@repo/email](packages/email/README.md)** — Email template library built with React Email
- **[@repo/db](packages/db/README.md)** — Drizzle schema, client factory, and named data-access functions


## Scripts

Run with `pnpm <script>`.

**Setup**
  - `setup` — Full setup (install, hooks, agent skills from basilic-skills `/w-*` plus antislop and make-interfaces-feel-better, gitleaks, osv, env templates, **Portless CA/proxy**, database, deepsec, Playwright Chromium)
  - `setup:skills` — Install `/w-*` playbooks, `antislop`, and `make-interfaces-feel-better` into `.agents/skills/` (restores `skills-lock.json`)
  - `setup:gitleaks`, `setup:osv` — Install Gitleaks, OSV scanner
  - `setup:playwright` — Install Playwright Chromium for API and web E2E
  - `setup:env` — Copy `.env.<qualifier>.example` templates to dest files when missing
  - `setup:portless` — Trust the Portless CA and start the HTTPS proxy (skip in CI; may prompt for sudo)
  - `setup:database` — Database tools (Docker, Supabase CLI)
  - `setup:deepsec` — Install DeepSec workspace (`.deepsec/`)
  - `db:start` / `db:stop` / `db:status` — Local Supabase Postgres (`pnpm --filter @repo/db …`)
  - `reset` — Local API database: Supabase reset + Drizzle migrations + seed (`pnpm --filter @repo/api reset`). See [apps/api/README.md](apps/api/README.md)

**Primary**
  - `build` — Build packages and apps
  - `dev` — Ensure Postgres, then Turbo TUI (named `https://*.localhost` URLs)
  - `qa` — Full check: install (if needed) → checktypes → lint → OpenAPI drift → build → test:scripts → test (unit) → test:e2e (Fastify + Next, `SKIP_BUILD=1`)
**Format / Lint**
  - `checktypes` — Type-check all packages
  - `format` — Format code (Biome)
  - `lint` — Lint with Biome + ESLint
  - `lint:biome`, `lint:biome:fix` — Biome check, fix
  - `lint:eslint`, `lint:eslint:fix` — ESLint check, fix
  - `lint:fix` — Fix both linters
**Test**
  - `test` — Run unit tests (packages + apps)
  - `test:e2e` — E2E (Fastify + Next)
**CI**
  - Lint and `security.yml` run on every PR. DeepSec reviews the PR diff on same-repo PRs from OWNER, MEMBER, or COLLABORATOR (`deepsec.yml`). App E2E (`web-e2e`, `api-e2e`) and package tests (`packages-test`) run only when relevant code changes. Mobile: EAS build, preview on main, PR OTA—see [GitHub Actions](https://basilic-docs.vercel.app/docs/deployment/github-actions) and [Mobile CI/CD](https://basilic-docs.vercel.app/docs/deployment/mobile-cicd).
**Security**
  - `security:block-files` — Block sensitive file patterns
  - `security:secrets` — Scan staged files for secrets
  - `security:secrets:full` — Full Gitleaks scan
  - `security:osv` — OSV vulnerability scan
  - `security:audit` — pnpm audit (high+; registry errors ignored)
  - `security:check` — Run security check script
  - `security:deepsec:scan` — DeepSec regex scan (no AI)
  - `security:deepsec:process:diff` — DeepSec AI review vs `origin/main` (GPT-5.6 Sol)
  - `security:deepsec:process:diff:grok` — Same review with Cursor Grok 4.6
  - `security:deepsec:process` — DeepSec full-repo AI review (GPT-5.6 Sol)
  - `security:deepsec:report` — DeepSec findings summary
**Hooks**
  - `hooks:pre-commit` — Pre-commit: security + Biome staged
  - `hooks:security` — Block files, scan secrets, OSV
**Misc**
  - `update-deps` — Update pnpm via Corepack and all dependencies

## Documentation

The Fastify API host exposes unauthenticated `/llms.txt`, live `/openapi.json`, and `/.well-known/api-catalog` (RFC 9727). OpenAPI is the canonical machine contract; agents use the spec, `@repo/core`, and `@repo/cli`. There is no product MCP. If MCP is useful later, it would be an isolated Fastify module, not a separate app. Durable agents run on eve in `apps/agents` (hello; not copied by create-basilic yet) — [runtime ADR](https://basilic-docs.vercel.app/docs/adrs/014-fastify-eve-vercel-runtime). Paths and landing contract: [API architecture](https://basilic-docs.vercel.app/docs/architecture/api).

Full docs: [basilic-docs.vercel.app](https://basilic-docs.vercel.app/docs)

- [Getting Started](https://basilic-docs.vercel.app/docs/development) — `npx create-basilic@latest`, `pnpm setup`, `pnpm db:start`, `pnpm dev`
- [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready) — generate-and-run bar (not CI green)
- [After fork](https://basilic-docs.vercel.app/docs/development/after-fork) — generator vs fork, what to replace, CI secrets
- Visual: [`DESIGN.md`](DESIGN.md)
- [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments) — Portless `.localhost` URLs, remote, Expo
- [AI Workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)

MIT licensed.

