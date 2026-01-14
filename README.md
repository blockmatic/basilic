# Basilic

TypeScript monorepo with code-first API architecture.

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

See [Security Guide](https://basilic-docs.vercel.app/docs/guides/security) for complete details.

## Structure

- **`apps/`** - Applications (API, Web, Docs)
- **`packages/`** - Shared packages (contracts, core, react, types, ui)
- **`devtools/`** - Shared development tooling (eslint, react, typescript configs)

## Documentation

Full documentation: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Get Started
- [Getting Started](https://basilic-docs.vercel.app/docs/getting-started) - 15-minute setup guide
- [AI-Driven Development](https://basilic-docs.vercel.app/docs/ai-workflow) - Recommended workflow with Cursor

### Core Concepts
- [Monorepo Structure](https://basilic-docs.vercel.app/docs/monorepo) - Package organization
- [Code-First APIs](https://basilic-docs.vercel.app/docs/contracts) - OpenAPI and hey-api pattern
- [Portability Strategy](https://basilic-docs.vercel.app/docs/portability) - Zero vendor lock-in

### Guides
- [Security Guide](https://basilic-docs.vercel.app/docs/guides/security) - Security baseline and secret scanning
- [Deployment Guide](https://basilic-docs.vercel.app/docs/guides/deployment) - Deployment options and strategies
- [Publishing Guide](https://basilic-docs.vercel.app/docs/guides/publishing) - Publishing packages to npm

### Cursor Setup
- [Cursor Setup Guide](https://basilic-docs.vercel.app/docs/cursor-setup) - Configure IDE and MCP servers
- [Cursor Rules](https://basilic-docs.vercel.app/docs/cursor-rules) - Coding standards

### Deep Dives
- [Architecture](https://basilic-docs.vercel.app/docs/architecture) - Architecture overview
- [Architecture Decisions](https://basilic-docs.vercel.app/docs/adrs) - ADRs documenting key technical decisions