# @basilic/ui

Shared UI component library built with Shadcn/ui and Tailwind CSS.

## Overview

Pre-configured, accessible UI components using Radix UI primitives and Tailwind CSS.

## Usage

```tsx
import { Button } from '@basilic/ui/components/button'
import { cn } from '@basilic/ui/lib/utils'
import '@basilic/ui/globals.css'
```

## Exports

- `@basilic/ui/components/*` - Shadcn/ui components
- `@basilic/ui/lib/utils` - Utilities (`cn`, etc.)
- `@basilic/ui/globals.css` - Global styles and theme variables
- `@basilic/ui/radix` - Radix UI primitives
- `@basilic/ui/postcss.config` - PostCSS configuration

## Architecture

Centralized design system dependencies:
- All `@radix-ui/react-*` packages
- Styling utilities (`clsx`, `tailwind-merge`, `class-variance-authority`)
- Single source of truth for component versions

See [Design System ADR](https://basilic-docs.vercel.app/docs/adrs/004-design-system) for details.
