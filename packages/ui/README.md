# @repo/ui

Shared UI component library built with Shadcn/ui and Tailwind CSS.

## Overview

Pre-configured, accessible UI components using Radix UI primitives and Tailwind CSS.

## Usage

```tsx
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import '@repo/ui/globals.css'
```

## Exports

- `@repo/ui/components/*` - Shadcn/ui components
- `@repo/ui/lib/utils` - Utilities (`cn`, etc.)
- `@repo/ui/globals.css` - Global styles and theme variables
- `@repo/ui/radix` - Radix UI primitives
- `@repo/ui/postcss.config` - PostCSS configuration

## Architecture

Centralized design system dependencies:
- All `@radix-ui/react-*` packages
- Styling utilities (`clsx`, `tailwind-merge`, `class-variance-authority`)
- Single source of truth for component versions

## Dependency Strategy

This package follows the **Component Library** pattern:

- **Bundled Dependencies**: All component dependencies are bundled (`zod`, `date-fns`, `lucide-react`, `next-themes`, `react-hook-form`, Radix UI packages, etc.)
- **Peer Dependencies**: Framework dependencies only (`react`, `react-dom`) - consumers control React version
- **Rationale**: Simpler developer experience - install `@repo/ui` and it works. Version consistency across all apps. Follows industry patterns (shadcn/ui, Material-UI, Chakra UI)

## Package Exports

This package is currently ESM-only (`"type": "module"`). For dual-mode support (ESM + CommonJS), the package.json exports should be updated to include both `"import"` and `"require"` targets pointing to ESM and CJS build artifacts respectively. Platform-specific subpath exports (e.g., `@repo/ui/node` or `@repo/ui/nextjs`) can be added if the package exposes Node- or Next.js-specific entry points.

See [Frontend Stack](@apps/docu/content/docs/architecture/frontend-stack.mdx) for design system details.
