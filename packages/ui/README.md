# @repo/ui

Shared UI component library built with Shadcn/ui and Tailwind CSS.

## Overview

Pre-configured, accessible UI components using Radix UI primitives and Tailwind CSS. All components are mobile-first and follow accessibility best practices.

## Exports

- `@repo/ui/components/*` - Shadcn/ui components
- `@repo/ui/lib/utils` - Utilities (`cn` for class merging)
- `@repo/ui/hooks/*` - React hooks (e.g., `use-mobile`)
- `@repo/ui/globals.css` - Global styles and theme variables
- `@repo/ui/radix` - Radix UI primitives
- `@repo/ui/postcss.config` - PostCSS configuration

## Usage

### Basic Component Usage

```tsx
import { Button } from '@repo/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/card'
import { cn } from '@repo/ui/lib/utils'
import '@repo/ui/globals.css'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### Using the `cn` Utility

The `cn` utility merges Tailwind classes intelligently:

```tsx
import { cn } from '@repo/ui/lib/utils'

function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn('base-classes', className)}>
      {/* Merges classes, handles conflicts */}
    </div>
  )
}
```

### Using Hooks

```tsx
import { useIsMobile } from '@repo/ui/hooks/use-mobile'

function ResponsiveComponent() {
  const isMobile = useIsMobile()
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* Content */}
    </div>
  )
}
```

## Available Components

The package includes 50+ pre-built components:

**Layout & Structure:**
- `accordion`, `card`, `separator`, `resizable`, `sidebar`, `tabs`

**Forms & Inputs:**
- `button`, `button-group`, `checkbox`, `input`, `input-group`, `input-otp`, `label`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`, `field`, `form`

**Overlays & Dialogs:**
- `alert-dialog`, `dialog`, `drawer`, `dropdown-menu`, `hover-card`, `popover`, `sheet`, `tooltip`, `context-menu`, `menubar`

**Navigation:**
- `breadcrumb`, `navigation-menu`, `pagination`

**Feedback:**
- `alert`, `progress`, `skeleton`, `sonner` (toast), `spinner`, `empty`

**Data Display:**
- `avatar`, `badge`, `table`, `chart`, `carousel`, `calendar`, `aspect-ratio`, `scroll-area`, `collapsible`, `command`, `kbd`, `item`

See the `src/components/` directory for the complete list and individual component documentation.

## Theming

Components use CSS variables for theming. Import the global styles to get the default theme:

```tsx
import '@repo/ui/globals.css'
```

Customize the theme by overriding CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other theme variables */
}
```

Components automatically adapt to light/dark mode when using `next-themes` or similar solutions.

## Accessibility

All components are built on Radix UI primitives and follow WAI-ARIA guidelines:

- Keyboard navigation support
- Screen reader announcements
- Focus management
- ARIA attributes
- Color contrast compliance

## Mobile-First Design

All components are designed mobile-first. They adapt to larger screens using Tailwind breakpoints:

- Base styles apply to mobile (< 640px)
- `sm:` breakpoint (≥ 640px)
- `md:` breakpoint (≥ 768px)
- `lg:` breakpoint (≥ 1024px)
- `xl:` breakpoint (≥ 1280px)
- `2xl:` breakpoint (≥ 1536px)

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

See [Frontend Architecture](@apps/docu/content/docs/architecture/frontend.mdx) for design system details.

## Scripts

- `pnpm --filter @repo/ui checktypes` - Type-check
- `pnpm --filter @repo/ui test` - Run tests
