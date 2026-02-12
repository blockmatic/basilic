# Basilic: Web3 & AI App Starters

Full-stack monorepo starter for Web3 and AI applications.

> 🚧 **Active development** — Explore, fork, and contribute. 🏗️

## Features

- 🤖 **AI-first dev workflow** — Agent rules, skills, MCP integrations, and automated CodeRabbit reviews
- 🔌 **REST API & JWT** — OpenAPI spec, Swagger UI, JWT auth for all clients
- 📦 **SDK generation** — Type-safe clients from OpenAPI via HeyAPI
- 🧩 **Web3 & AI starters** — Ready-to-use templates for Next.js, React, Expo, Fastify, and Ponder
- 🔓 **Zero vendor lock-in** — Run on VPS, AWS, Vercel, or local
- 🎨 **Turbo monorepo + design system** — ShadcnUI components with shared utilities
- ⚙️ **Preconfigured dev tools** — Biome, Git workflows, hooks, and security checks
- 🛡️ **Security & quality** — Automated checks in CI (e.g. Gitleaks, OSV)
- ⛓️ **Multichain** — EVM, Solana, Cosmos; tooling and smart contract dev environments
- 📐 **Conventions** — Cursor rules per domain, @repo/sentry, Pino logging, shared TS and style
- 🧑‍💻 **TypeScript-first** — End-to-end types from database to frontend

## Technology stack

- **AI:** AI SDK, OpenAI, Claude, Grok
- **Frontend:** Next.js 16, React 19, Tailwind, ShadcnUI
- **Backend:** Fastify, PostgreSQL, Supabase
- **Web3:** Solidity, Viem, Wagmi, Ponder, Solana
- **DevOps:** pnpm, TurboRepo, TypeScript, Biome, ESLint

## Scripts

- `pnpm setup` - Full setup (install, hooks, security, EVM, Solana, database)
- `pnpm dev` - Start all apps (Fastify, Next, watchers)
- `pnpm build` - Build packages and apps
- `pnpm test` - Run tests
- `pnpm lint` / `pnpm lint:fix` - Lint and fix
- `pnpm qa` - Pre-commit quality check (install, checktypes, lint, build, test)

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

## Documentation

Full docs: [basilic-docs.vercel.app](https://basilic-docs.vercel.app/docs)

