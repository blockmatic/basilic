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

See [Frontend Stack](@apps/docu/content/docs/architecture/frontend-stack.mdx) for design system details.
