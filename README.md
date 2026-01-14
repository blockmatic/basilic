# Basilic

TypeScript monorepo with contract-first API architecture.

## Requirements

- **Node.js**: `>=22`
- **pnpm**: `10.28.0`

## Quick Start

```bash
pnpm install
pnpm dev
```

## Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code (Biome + ESLint)
- `pnpm format` - Format all code (Biome)
- `pnpm typecheck` - Type check all TypeScript

## Structure

- **`apps/`** - Applications (API, Docs)
- **`packages/`** - Shared packages (contracts, core, react, types, ui)
- **`devtools/`** - Shared development tooling (eslint, react, typescript configs)

## Documentation

Full documentation: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Get Started
- [Getting Started](https://basilic-docs.vercel.app/docs/getting-started) - 15-minute setup guide
- [AI-Driven Development](https://basilic-docs.vercel.app/docs/ai-workflow) - Recommended workflow with Cursor

### Core Concepts
- [Monorepo Structure](https://basilic-docs.vercel.app/docs/monorepo) - Package organization
- [Contract-First APIs](https://basilic-docs.vercel.app/docs/contracts) - OpenAPI and hey-api pattern
- [Portability Strategy](https://basilic-docs.vercel.app/docs/portability) - Zero vendor lock-in

### Cursor Setup
- [Cursor Setup Guide](https://basilic-docs.vercel.app/docs/cursor-setup) - Configure IDE and MCP servers
- [Cursor Rules](https://basilic-docs.vercel.app/docs/cursor-rules) - Coding standards

### Deep Dives
- [Architecture](https://basilic-docs.vercel.app/docs/architecture) - Architecture overview
- [Architecture Decisions](https://basilic-docs.vercel.app/docs/adrs) - ADRs documenting key technical decisions