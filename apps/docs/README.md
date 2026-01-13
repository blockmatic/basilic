# Vencura Documentation Site

Fumadocs-based documentation site for high-level architecture, ADRs, deployment strategy, and AI-assisted workflow documentation.

## Overview

This is the **@docs** site - the canonical place for high-level architecture, stack overview, and workflows. It's built with **Fumadocs** (Next.js + MDX) and serves as the central documentation hub for the Vencura monorepo.

## Purpose

The docs site focuses on:

- **High-level architecture**: Monorepo layout, key components, and how they interact
- **Stack & conventions**: Major tech choices (Elysia, Next.js, Fumadocs, Bun, Biome + ESLint, Viem/Wagmi, `@basilic/*` packages)
- **ADRs**: Architecture Decision Records documenting key technical decisions (see [Architecture Decisions](./content/docs/adrs/index.mdx))
- **Deployment & environments**: Thin-layer Vercel design, environment strategy, Google Cloud/Pulumi options
- **AI-assisted workflow**: How MCP servers, Cursor rules, and v0 are used in development (see [MCP Servers](./content/docs/mcp-servers/index.mdx))
- **Testing patterns**: Blackbox Vitest strategy (see [Testing Patterns](./content/docs/tooling/testing-patterns.mdx))

**Workspace Context**: This app is part of the **apps tier** in our 4-tier workspace model (`apps/*` for user-facing products). It consumes shared packages (`@basilic/ui`, `@basilic/types`) and shared configs (`@basilic/eslint-config`, `@basilic/typescript-config`), while `_dev/` contains internal infra scripts and templates. See [`_dev/README.md`](../../_dev/README.md) for workspace structure details.

For app-specific documentation, see individual app READMEs:
- [Vencura API](../../apps/api/README.md)
- [Vencura Web](../../apps/web/README.md)
- [Mathler](../../apps/mathler/README.md)

## Tech Stack

- **Next.js** - React framework
- **Fumadocs** - Documentation framework built on Next.js and MDX
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Tooling

This app follows the monorepo tooling standards:

- **Package Manager**: Bun (see [ADR 005: Package Manager](./content/docs/adrs/005-package-manager/index.mdx))
- **Linting & Formatting**: Biome + ESLint (see [ADR 006: Linters](./content/docs/adrs/006-linters/index.mdx))
  - **Formatting**: Use root-level `bun run format` (Biome) for consistent formatting across the monorepo
  - **Linting**: ESLint for rule enforcement (configured via `@basilic/eslint-config`)

### Development Commands

**From monorepo root:**
- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all apps
- `bun run format` - Format all code using Biome (use this for formatting)
- `bun run lint` - Lint all apps using ESLint

**From `apps/docs` directory:**
- `bun run dev` - Start docs site in development mode
- `bun run build` - Build docs site for production
- `bun run start` - Start production server
- `bun run types:check` - Type check MDX files and TypeScript
- `bun run lint` - Lint using ESLint

**Note**: Formatting is handled at the root level via `bun run format` - no local format script needed.

## Getting Started

### Prerequisites

- Bun >= 1.3.2
- Node.js >= 20

### Running Locally

```bash
# From monorepo root
bun run dev

# Or from this directory
cd apps/docs
bun run dev
```

Open http://localhost:3000 with your browser to see the result.

## Content Structure

Documentation content lives in:

- **`content/docs/`** - MDX documentation files
  - `adrs/` - Architecture Decision Records
  - `architecture/` - Architecture overview
  - `deployment/` - Deployment strategy
  - `environment/` - Environment variable patterns
  - `getting-started/` - Quick start guides
  - `mcp-servers/` - MCP server documentation
  - `packages/` - Package documentation
  - `apps/` - Application documentation
  - `tooling/testing-patterns.mdx` - Monorepo-wide Vitest blackbox testing strategy
- **`source.config.ts`** - Fumadocs configuration (frontmatter schema, etc.)

## Adding Documentation

1. Create or edit MDX files in `content/docs/`
2. Use frontmatter for metadata:
   ```mdx
   ---
   title: "Page Title"
   description: "Page description"
   ---
   ```
3. Content will be automatically indexed and searchable

### Rich Media Components

The docs site includes reusable components for enhancing documentation:

- **Diagram** - Visual diagrams and flowcharts (`<Diagram>`)
- **ComparisonTable** - Comparison tables (`<ComparisonTable>`)
- **DocsChart** - Data visualization charts (`<DocsChart>`)
- **DocsVideo** - Embedded videos (`<DocsVideo>`)

Components are located in `components/` and automatically available in all MDX files. See [Documentation Authoring Guide](./content/docs/tooling/docs-authoring.mdx) for usage examples and best practices.

## Development

```bash
# Development mode
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Type check MDX files
bun run types:check

# Lint
bun run lint

# Format (use root-level command)
# From monorepo root: bun run format
```

## Related Documentation

- [Fumadocs Documentation](https://fumadocs.dev) - Fumadocs framework docs
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Root README](../../README.md) - Monorepo overview and getting started

## License

PROPRIETARY
