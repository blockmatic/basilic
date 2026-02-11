# Documentation

Fumadocs-based documentation site for architecture, ADRs, and development workflows.

## Overview

Central documentation hub built with **Fumadocs** (Next.js + MDX) for this monorepo. The documentation covers architecture decisions, development guides, API patterns, and best practices for working with the monorepo.

## Development

```bash
pnpm dev
```

Starts docs site at [http://localhost:3002](http://localhost:3002).

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm checktypes` - Type check MDX and TypeScript

## Content

Documentation content in `content/docs/`:

- `adrs/` - Architecture Decision Records documenting key technical decisions
- `architecture/` - Package architecture, patterns, and technology choices
- `development/` - Quick start, setup, tooling, and AI-assisted development
- `deployment/` - Deployment options, GitHub Actions, publishing, Vercel
- `testing/` - Testing patterns and frontend testing
- `blockchain/` - EVM and Solana contract development

## Documentation

Live site: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Key Guides

- **[Security Guide](@apps/docu/content/docs/security/index.mdx)** - Security baseline, secret scanning, and vulnerability management
- **[Deployment Guide](@apps/docu/content/docs/deployment/index.mdx)** - Deployment options and strategies for all applications
- **[Publishing Guide](@apps/docu/content/docs/deployment/publishing.mdx)** - Publishing packages to npm using dual-mode exports
- **[Environment Setup](@apps/docu/content/docs/development/index.mdx)** - Configuring environment variables

### Architecture

- **[Architecture Overview](@apps/docu/content/docs/architecture/index.mdx)** - System architecture and design patterns
- **[API Development](@apps/docu/content/docs/architecture/api.mdx)** - Backend stack, Fastify, OpenAPI, Hey API
- **[Frontend Stack](@apps/docu/content/docs/architecture/frontend-stack.mdx)** - Next.js, React, and UI components
- **[Portability Strategy](@apps/docu/content/docs/architecture/portability.mdx)** - Zero vendor lock-in architecture
