# Basilic: API-First TypeScript FullStack Starter

Fork-and-run developer starter: typed SDKs, self-hosted auth, a portable architecture, Cursor-first workflow, and a thin web demo. Fastify • OpenAPI • Next.js • Expo scaffold — one stack, multiple clients.

MIT licensed. Start a product with GitHub **Use this template**, or fork to contribute back. First successful use is [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready) (`pnpm setup`, `db:start`, `pnpm reset`, `pnpm dev`, `test@test.ai`). After you own the copy: [After fork](https://basilic-docs.vercel.app/docs/development/after-fork).

## Features

- 🤖 **AI-first dev workflow** — Agent rules, `/b` workflow skills, FIRST `/f-*` decisions, MCP integrations, and automated CodeRabbit reviews
- 🔌 **REST API & JWT** — OpenAPI spec, Swagger UI, JWT and API key auth for all clients
- 📦 **SDK generation** — Type-safe clients from OpenAPI via HeyAPI
- 🧩 **Web + API starters** — Next.js demo, React hooks, Expo UI scaffold, Fastify API (not a wallet or OpenAI template)
- 🔓 **Zero vendor lock-in** — Run on VPS, AWS, Vercel, or local
- 🎨 **Turbo monorepo + design system** — ShadcnUI components with shared utilities
- ⚙️ **Preconfigured dev tools** — Biome, Git workflows, hooks, and security checks
- 🛡️ **Security & quality** — Automated checks in CI (Gitleaks, OSV, DeepSec)
- ⛓️ **Multichain (API)** — EVM and Solana SIWE/SIWS on Fastify; shared `@repo/utils/web3` helpers — not a web wallet demo
- 📐 **Conventions** — Cursor rules per domain, @repo/error, Pino logging, shared TS and style
- 🧑‍💻 **TypeScript-first** — End-to-end types from database to frontend

## Technology stack

- **AI (in-app):** AI SDK — Anthropic, OpenRouter, Ollama (no first-class OpenAI SDK)
- **Frontend:** Next.js 16, React 19, Tailwind, ShadcnUI
- **Backend:** Fastify, PostgreSQL, Supabase
- **Web3:** Fastify SIWE/SIWS + `@repo/utils/web3` helpers. **No Wagmi and no wallet UI in `apps/web`**
- **DevOps:** Node.js 24.x (LTS Krypton), pnpm, TurboRepo, TypeScript, Biome, ESLint

## Apps

- **[API](apps/api/README.md)** — Type-safe REST API built with Fastify & OpenAPI
- **[Web App](apps/web/README.md)** — Next.js app with monorepo integration
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


## Scripts

Run with `pnpm <script>`.

**Setup**
  - `setup` — Full setup (install, hooks, gitleaks, osv, env templates, database, deepsec, Playwright Chromium)
  - `setup:gitleaks`, `setup:osv` — Install Gitleaks, OSV scanner
  - `setup:playwright` — Install Playwright Chromium for API and web E2E
  - `setup:env` — Copy `.env.<qualifier>.example` templates to dest files when missing
  - `setup:database` — Database tools (Docker, Supabase CLI)
  - `setup:deepsec` — Install DeepSec workspace (`.deepsec/`)
  - `reset` — Local API database: Supabase reset + Drizzle migrations + seed (`pnpm --filter @repo/api reset`). See [apps/api/README.md](apps/api/README.md)

**Primary**
  - `build` — Build packages and apps
  - `dev` — Start dev (core, react, error, utils, api, web)
  - `qa` — Full check: install (if needed) → checktypes → lint → OpenAPI drift → build → test (unit) → test:e2e (Fastify + Next, `SKIP_BUILD=1`)
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
  - `update-deps` — Update pnpm and all dependencies

## Documentation

Full docs: [basilic-docs.vercel.app](https://basilic-docs.vercel.app/docs)

- [Getting Started](https://basilic-docs.vercel.app/docs/development) — clone or Use this template, `pnpm setup`, `db:start`, `pnpm reset`, `pnpm dev`
- [Product Ready](https://basilic-docs.vercel.app/docs/testing/product-ready) — fork-and-run bar (not CI green)
- [After fork](https://basilic-docs.vercel.app/docs/development/after-fork) — template vs fork, what to replace, CI secrets
- Maintainers: [`_first/basilic/PRODUCT.md`](_first/basilic/PRODUCT.md) — intent, feature map, roadmap
- [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments) — Local vs remote (ports 3000, 3001, 8081; `start:localhost`, `start:tunnel`)
- FIRST factory (stations, overlays): [`_first/`](_first/README.md) — load `_first/AGENTS.md` then `_first/ABOUT.md` then `_first/FIRST.md`. See [AI Workflow](https://basilic-docs.vercel.app/docs/development/ai-workflow)

