# Basilic

TypeScript monorepo with REST API architecture.

## Requirements

- **Node.js**: `>=22`
- **pnpm**: `10.28.0`

## Quick Start

```bash
pnpm install
pnpm dev
```

## Commands

### Development
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code (Biome + ESLint)
- `pnpm format` - Format all code (Biome)
- `pnpm checktypes` - Type check all TypeScript
- `pnpm test` - Run all tests

### Security
- `pnpm secrets:scan:staged` - Scan staged files for secrets (gitleaks)
- `pnpm secrets:scan` - Scan entire repository for secrets (gitleaks)
- `pnpm deps:osv` - Scan dependencies for vulnerabilities (OSV Scanner)
- `pnpm deps:audit` - Run pnpm audit for dependency vulnerabilities

## CI/CD Workflows

GitHub Actions workflows automate quality checks:

### Lint Workflow (`.github/workflows/lint.yml`)

Runs on all pull requests to ensure code quality:
- Executes `pnpm lint` (Biome + ESLint)
- Catches linting errors before merge
- Can be manually triggered via `workflow_dispatch`

### Security Workflow (`.github/workflows/security.yml`)

Runs on all pull requests and pushes to main:
- **Secret scanning** - Scans repository with gitleaks and TruffleHog
- **Dependency scanning** - Checks for vulnerabilities with OSV Scanner and pnpm audit
- **Git history scan** - Scans entire git history for exposed secrets
- All checks must pass for CI to succeed

See [Security Guide](@apps/docs/content/docs/security/index.mdx) for complete details.

## Structure

- **`apps/`** - Applications (API, Web, Docs)
- **`packages/`** - Shared packages (core, react, ui, utils)
- **`devtools/`** - Shared development tooling (eslint, react, typescript configs)

## Documentation

Full documentation: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Get Started
- [Getting Started](@apps/docs/content/docs/getting-started/index.mdx) - 15-minute setup guide
- [AI-Driven Development](@apps/docs/content/docs/getting-started/ai-workflow.mdx) - Recommended workflow with Cursor

### Core Concepts
- [Monorepo Structure](@apps/docs/content/docs/core-concepts/monorepo-structure.mdx) - Package organization
- [API Development](@apps/docs/content/docs/core-concepts/api-architecture.mdx) - REST API with OpenAPI and client generation
- [Portability Strategy](@apps/docs/content/docs/architecture/portability.mdx) - Zero vendor lock-in

### Guides
- [Security Guide](@apps/docs/content/docs/security/index.mdx) - Security baseline and secret scanning
- [Error Handling Guide](@apps/docs/content/docs/architecture/error-handling.mdx) - Error handling with Sentry integration
- [Deployment Guide](@apps/docs/content/docs/deployment/index.mdx) - Deployment options and strategies
- [Publishing Guide](@apps/docs/content/docs/deployment/publishing.mdx) - Publishing packages to npm

### Cursor Setup
- [Cursor Setup Guide](@apps/docs/content/docs/getting-started/cursor-setup.mdx) - Configure IDE and MCP servers
- [Cursor Rules](@apps/docs/content/docs/core-concepts/cursor-rules.mdx) - Coding standards

### Deep Dives
- [Architecture](@apps/docs/content/docs/architecture/index.mdx) - Architecture overview