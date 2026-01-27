# Basilic

TypeScript monorepo with REST API architecture.

## Requirements

- **Node.js**: `22.x`
- **pnpm**: `10.28.0`

### Node.js Setup

Install and set Node.js 22 as default using nvm:

```bash
nvm install 22 && nvm alias default 22
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Commands

### Development
- `pnpm dev` - Start all apps in development mode (see [Development Workflow](#development-workflow))
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code (Biome + ESLint)
- `pnpm format` - Format all code (Biome)
- `pnpm checktypes` - Type check all TypeScript
- `pnpm test` - Run all tests
- `pnpm qa` - Quality assurance: install dependencies, lint, type-check, build, and test everything

## Development Workflow

### Turborepo Setup

This monorepo uses **Turborepo** for task orchestration and caching. Turborepo provides:

- **Intelligent caching** - Only rebuilds what changed
- **Parallel execution** - Runs independent tasks simultaneously
- **Task dependencies** - Ensures correct build order
- **Remote caching** - Share cache across team and CI/CD

### `pnpm dev` - Development Mode

The `pnpm dev` command starts all development servers with watch mode:

```bash
pnpm dev
```

This runs:
- **`@repo/core`** - Watches for OpenAPI changes and regenerates API client
- **`@repo/react`** - Watches for OpenAPI changes and regenerates React hooks, watches TypeScript for rebuilds
- **`@repo/error`** - Watches TypeScript for rebuilds
- **`@repo/utils`** - Watches TypeScript for rebuilds
- **`@repo/fastify`** - Starts Fastify API server with OpenAPI generation watcher
- **`@repo/next`** - Starts Next.js development server

**Key Features:**
- **Watch mode** - All packages automatically rebuild when source files change
- **OpenAPI regeneration** - `core` and `react` packages watch for OpenAPI spec changes and regenerate clients
- **Hot reload** - Next.js and Fastify support hot module replacement

### `pnpm qa` - Quality Assurance

The `pnpm qa` command runs a complete quality check:

```bash
pnpm qa
```

This executes:
1. **`pnpm i`** - Install/update dependencies
2. **`pnpm lint:fix`** - Auto-fix linting issues (ESLint + Biome)
3. **`turbo run checktypes build test`** - Type-check, build, and test all packages (excluding contracts)

**Use Cases:**
- Before committing changes
- Before opening a pull request
- In CI/CD pipelines
- When verifying the entire codebase

### Running Individual Apps

You can run individual apps directly, but remember to build dependencies first:

```bash
# Build required packages
pnpm build --filter=@repo/core --filter=@repo/react --filter=@repo/error --filter=@repo/utils

# Then run the app
cd apps/next
pnpm dev
```

See individual app READMEs (e.g., `apps/next/README.md`) for app-specific instructions.

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

See [Security Guide](@apps/docu/content/docs/security/index.mdx) for complete details.

## Structure

- **`apps/`** - Applications (API, Web, Docs)
- **`packages/`** - Shared packages (core, react, ui, utils)
- **`devtools/`** - Shared development tooling (eslint, react, typescript configs)

## Documentation

Full documentation: [https://basilic-docs.vercel.app/docs](https://basilic-docs.vercel.app/docs)

### Get Started
- [Getting Started](@apps/docu/content/docs/getting-started/index.mdx) - 15-minute setup guide
- [AI-Driven Development](@apps/docu/content/docs/getting-started/ai-workflow.mdx) - Recommended workflow with Cursor

### Core Concepts
- [Monorepo Structure](@apps/docu/content/docs/core-concepts/monorepo-structure.mdx) - Package organization
- [API Development](@apps/docu/content/docs/core-concepts/api-architecture.mdx) - REST API with OpenAPI and client generation
- [Portability Strategy](@apps/docu/content/docs/architecture/portability.mdx) - Zero vendor lock-in

### Guides
- [Development Tooling](@apps/docu/content/docs/architecture/dev-tooling.mdx) - Turborepo setup, pnpm dev, and pnpm qa workflows
- [Security Guide](@apps/docu/content/docs/security/index.mdx) - Security baseline and secret scanning
- [Error Handling Guide](@apps/docu/content/docs/architecture/error-handling.mdx) - Error handling with Sentry integration
- [Deployment Guide](@apps/docu/content/docs/deployment/index.mdx) - Deployment options and strategies
- [Publishing Guide](@apps/docu/content/docs/deployment/publishing.mdx) - Publishing packages to npm

### Cursor Setup
- [Cursor Setup Guide](@apps/docu/content/docs/getting-started/cursor-setup.mdx) - Configure IDE and MCP servers
- [Cursor Rules](@apps/docu/content/docs/core-concepts/cursor-rules.mdx) - Coding standards

### Deep Dives
- [Architecture](@apps/docu/content/docs/architecture/index.mdx) - Architecture overview