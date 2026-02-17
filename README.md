# Basilic: Web3 & AI App Starter

Full-stack monorepo starter for Web3 and AI apps. Built for teams shipping products that need SDKs, public APIs, and multichain support—without rebuilding auth, OpenAPI tooling, or design systems from scratch. Ship features faster; security, docs, and AI-assisted workflows are included.

> 🚧 **Active development** — Explore, fork, and contribute. 🏗️

## Features

- 🤖 **AI-first dev workflow** — Agent rules, skills, MCP integrations, and automated CodeRabbit reviews
- 🔌 **REST API & JWT** — OpenAPI spec, Swagger UI, JWT and API key auth for all clients
- 📦 **SDK generation** — Type-safe clients from OpenAPI via HeyAPI
- 🧩 **Web3 & AI starters** — Ready-to-use templates for Next.js, React, Expo, Fastify, and Ponder
- 🔓 **Zero vendor lock-in** — Run on VPS, AWS, Vercel, or local
- 🎨 **Turbo monorepo + design system** — ShadcnUI components with shared utilities
- ⚙️ **Preconfigured dev tools** — Biome, Git workflows, hooks, and security checks
- 🛡️ **Security & quality** — Automated checks in CI (e.g. Gitleaks, OSV)
- ⛓️ **Multichain** — EVM, Solana, Cosmos; shared validation and chain-specific tooling
- 📐 **Conventions** — Cursor rules per domain, @repo/sentry, Pino logging, shared TS and style
- 🧑‍💻 **TypeScript-first** — End-to-end types from database to frontend

## Technology stack

- **AI:** AI SDK, OpenAI, Claude, Grok
- **Frontend:** Next.js 16, React 19, Tailwind, ShadcnUI
- **Backend:** Fastify, PostgreSQL, Supabase
- **Web3:** Solidity, Viem, Wagmi, Ponder, Solana
- **DevOps:** pnpm, TurboRepo, TypeScript, Biome, ESLint

## Apps

- **[API](apps/fastify/README.md)** — Type-safe REST API built with Fastify & OpenAPI
- **[Web App](apps/next/README.md)** — Next.js app with monorepo integration
- **[Documentation](apps/docu/README.md)** — Fumadocs-based docs site for architecture, ADRs, and development workflows

## Packages

- **[@repo/core](packages/core/README.md)** — Runtime-agnostic API client and types generated from OpenAPI specs
- **[@repo/react](packages/react/README.md)** — React Query hooks for `@repo/core` API functions
- **[@repo/ui](packages/ui/README.md)** — Shared UI component library (Shadcn/ui, Tailwind)
- **[@repo/utils](packages/utils/README.md)** — Shared utilities (async, data, debug, error, logger, web3)
- **[@repo/sentry](packages/sentry/README.md)** — Common `captureError` interface for error reporting
- **[@repo/email](packages/email/README.md)** — Email template library built with React Email
- **[@repo/notif](packages/notif/README.md)** — Notification service (email, activity) with type-safe schemas


## Scripts

Run with `pnpm <script>`.

**Setup**
  - `setup` — Full setup (install, hooks, gitleaks, osv, database)
  - `setup:gitleaks`, `setup:osv` — Install Gitleaks, OSV scanner
  - `setup:database` — Database tools
**Primary**
  - `build` — Build packages and apps
  - `dev` — Start dev (core, react, sentry, utils, fastify, next)
  - `qa` — Full check: install → checktypes → lint → build → test (unit) → test:e2e (Fastify + Next, local spawn)
**Format / Lint**
  - `checktypes` — Type-check all packages
  - `format` — Format code (Biome)
  - `lint` — Lint with Biome + ESLint
  - `lint:biome`, `lint:biome:fix` — Biome check, fix
  - `lint:eslint`, `lint:eslint:fix` — ESLint check, fix
  - `lint:fix` — Fix both linters
 **Test**
  - `test` — Run tests
  - `test:e2e` — E2E (Fastify + Next)
**Security**
  - `security:block-files` — Block sensitive file patterns
  - `security:secrets` — Scan staged files for secrets
  - `security:secrets:full` — Full Gitleaks scan
  - `security:osv` — OSV vulnerability scan
  - `security:audit` — pnpm audit (high+)
  - `security:check` — Run security check script
**Hooks**
  - `hooks:pre-commit` — Pre-commit: security + Biome staged
  - `hooks:security` — Block files, scan secrets, OSV
**Misc**
  - `update-deps` — Update pnpm and all dependencies


## E2E and Vercel deployments

E2E tests run after Vercel deployments via `repository_dispatch` events (Vercel-only). One workflow per project: `api-e2e-test.yml`, `next-e2e-test.yml`. Success → run tests; deployment failure/error → abort (PR check red); skipped/ignored/canceled → skip.

**Finding the project filter**: Check the PR’s **Actions** → workflow run → **Event** payload → `client_payload.project.name`. Adjust the `contains(...)` condition in each workflow if your Vercel project names differ.

## Documentation

Full docs: [basilic-docs.vercel.app](https://basilic-docs.vercel.app/docs)

