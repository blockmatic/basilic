# Documentation

Fumadocs-based documentation site for architecture, ADRs, and development workflows.

## Overview

Central documentation hub built with **Fumadocs** (Next.js + MDX) for this monorepo. The documentation covers architecture decisions, development guides, API patterns, and best practices for working with the monorepo.

## Development

```bash
pnpm dev
```

Starts docs site at [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm checktypes` - Type check MDX and TypeScript

## Content

Documentation content in `content/docs/`:

- `adrs/` - Architecture Decision Records documenting key technical decisions
- `architecture/` - Package architecture, patterns, and technology choices
- `getting-started/` - Quick start guides and setup instructions
- `guides/` - Step-by-step guides for common tasks:
  - **Security** - Security baseline and secret scanning
  - **Deployment** - Deployment options and strategies
  - **Publishing** - Publishing packages to npm
  - **Environment Setup** - Environment variable configuration
  - **Testing** - Testing patterns and best practices
  - **CI/CD Setup** - Setting up CI/CD workflows
- `tooling/` - Development tools and testing patterns

## Documentation

Live site: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Key Guides

- **[Security Guide](https://basilic-docs.vercel.app/docs/guides/security)** - Security baseline, secret scanning, and vulnerability management
- **[Deployment Guide](https://basilic-docs.vercel.app/docs/guides/deployment)** - Deployment options and strategies for all applications
- **[Publishing Guide](https://basilic-docs.vercel.app/docs/guides/publishing)** - Publishing packages to npm using dual-mode exports
- **[Environment Setup](https://basilic-docs.vercel.app/docs/guides/environment-setup)** - Configuring environment variables

### Architecture

- **[Architecture Overview](https://basilic-docs.vercel.app/docs/architecture)** - System architecture and design patterns
- **[Backend Stack](https://basilic-docs.vercel.app/docs/architecture/backend-stack)** - Fastify, OpenAPI, and API architecture
- **[Frontend Stack](https://basilic-docs.vercel.app/docs/architecture/frontend-stack)** - Next.js, React, and UI components
- **[Portability Strategy](https://basilic-docs.vercel.app/docs/portability)** - Zero vendor lock-in architecture
