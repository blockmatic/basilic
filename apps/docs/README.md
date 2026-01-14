# Basilic Docs

Fumadocs-based documentation site for architecture, ADRs, and development workflows.

## Overview

Central documentation hub built with **Fumadocs** (Next.js + MDX) for the Basilic monorepo.

## Development

```bash
pnpm dev
```

Starts docs site at [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm types:check` - Type check MDX and TypeScript

## Content

Documentation content in `content/docs/`:

- `adrs/` - Architecture Decision Records
- `architecture/` - Package architecture and patterns
- `getting-started/` - Quick start guides
- `tooling/` - Development tools and testing patterns

## Documentation

Live site: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

See [Deployment Documentation](https://basilic-docs.vercel.app/docs/deployment) for deployment strategy.
