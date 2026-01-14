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

- [Getting Started](https://basilic-docs.vercel.app/docs/getting-started)
- [Architecture](https://basilic-docs.vercel.app/docs/architecture)
- [ADRs](https://basilic-docs.vercel.app/docs/adrs)
