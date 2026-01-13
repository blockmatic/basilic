# `@basilic/ui`

Shared UI component library built with Shadcn/ui and Tailwind CSS for use across all frontend applications in the monorepo.

## Features

- **Shadcn/ui Components**: Pre-configured, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI Primitives**: Unstyled, accessible component primitives
- **TypeScript**: Full type safety
- **Theme Support**: CSS variables for dark mode (apps configure `next-themes` provider)

## Installation

This package is part of the monorepo and is automatically available to all apps. No separate installation needed.

## Usage

### Importing Components

```tsx
import { Button } from '@basilic/ui/components/button'
```

### Importing Utilities

```tsx
import { cn } from '@basilic/ui/lib/utils'
```

### Importing Styles

```tsx
// In your app's layout or global CSS
import '@basilic/ui/globals.css'
```

### Importing PostCSS Config

```tsx
// For Next.js apps that need to extend PostCSS config
import postcssConfig from '@basilic/ui/postcss.config'
export default postcssConfig
```

### Importing Radix UI Primitives

```tsx
// Import Radix UI primitives directly from the design system
import * as AccordionPrimitive from '@basilic/ui/radix'
// or import specific primitives
import { AccordionRoot, AccordionItem } from '@basilic/ui/radix'
```

## Available Exports

### Components

- `@basilic/ui/components/*` - All Shadcn/ui components (e.g., `button`, `card`, `input`, etc.)

### Radix UI Primitives

- `@basilic/ui/radix` - All Radix UI primitives re-exported for centralized access
  - Includes: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, popover, select, tabs, tooltip, and more
  - **Why centralized?** Ensures all apps use the same Radix UI versions, reduces bundle size, and simplifies maintenance

### Utilities

- `@basilic/ui/lib/utils` - Utility functions including `cn()` for className merging

### Styles

- `@basilic/ui/globals.css` - Global Tailwind CSS styles and theme variables

### Hooks

- `@basilic/ui/hooks/*` - Shared React hooks

### PostCSS Config

- `@basilic/ui/postcss.config` - PostCSS configuration for Tailwind CSS

## Dependency Strategy

This package serves as the **single source of truth** for all design system dependencies:

### Why Centralize Dependencies?

1. **Consistency**: All apps use the same versions of Radix UI, utilities, and styling libraries
2. **Reduced Bundle Size**: Shared dependencies are deduplicated across apps
3. **Easier Maintenance**: Update versions in one place instead of multiple apps
4. **Type Safety**: Shared TypeScript types ensure consistency across apps

### Centralized Dependencies

- **Radix UI Primitives**: All `@radix-ui/react-*` packages are managed here
- **Styling Utilities**: `class-variance-authority`, `clsx`, `tailwind-merge`
- **Icons**: `lucide-react` (used by UI components)
- **PostCSS**: Shared PostCSS configuration

### Apps Should NOT Install

❌ **Don't install these in apps** - Import from `@basilic/ui` instead:

- Any `@radix-ui/react-*` packages
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

✅ **Do install in apps** - App-specific dependencies:

- **`next-themes`**: Theme provider setup (each app configures its own provider)
- **`lucide-react`**: If you need icons directly (UI components already include it)
- Framework-specific packages (Next.js, React Router, etc.)
- App-specific libraries (data fetching, forms, etc.)
- Third-party integrations

**Note**: `next-themes` stays in apps because it's a provider that wraps your app and may have app-specific configuration. The theme CSS variables are centralized in `@basilic/ui/globals.css`.

## Mobile-First Design

All components in this package follow **mobile-first responsive design**:

- **Base styles** target mobile devices (default, no breakpoint prefix)
- **Enhancements** are added for larger screens using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- **Progressive enhancement** ensures mobile users get a great experience first

Example:

```tsx
// Mobile-first: column on mobile, row on larger screens
<div className="flex flex-col sm:flex-row gap-4">
  <div>Content 1</div>
  <div>Content 2</div>
</div>
```

See [Mobile-First Rules](../../.cursor/rules/frontend/mobile-first.mdc) for detailed guidelines and patterns.

## Tech Stack

- **Shadcn/ui**: Component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework (mobile-first breakpoints)
- **Radix UI**: Unstyled, accessible component primitives (all packages centralized)
- **React 19**: Latest React version
- **TypeScript**: Type-safe development
- **class-variance-authority**: For component variants
- **clsx** & **tailwind-merge**: For className utilities
- **lucide-react**: Icon library (used by UI components)

## Development

```bash
# Lint (from monorepo root)
bun run lint
```

## Adding New Components

To add new Shadcn/ui components:

1. Use the Shadcn CLI from any app directory:
   ```bash
   npx shadcn@latest add [component-name]
   ```
2. Point the `components.json` to this package's directory
3. Components will be added to `packages/ui/src/components/`

## License

PROPRIETARY
