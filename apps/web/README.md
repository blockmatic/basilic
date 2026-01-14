# Basilic Web App

A Next.js application in the Basilic monorepo. This is a minimal hello world application demonstrating the integration of Next.js with the Basilic monorepo architecture.

## Tech Stack

- **Next.js** 16.0.3 - React framework with App Router
- **React** 19.2.3 - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Component library (via `@basilic/ui`)
- **next-themes** - Theme provider for dark mode
- **nuqs** - URL state management

## Monorepo Integration

This app uses shared packages from the Basilic monorepo:

- **`@basilic/ui`** - Shared UI components and design system
- **`@basilic/types`** - Domain types
- **`@basilic/react`** - React Query hooks (for future API integration)
- **`@basilic/core`** - API client (for future API integration)

See the [monorepo documentation](../../apps/docs/content/docs/architecture/monorepo.mdx) for details on package architecture.

## Getting Started

### Prerequisites

- **Node.js** >= 22
- **pnpm** 10.28.0

### Installation

```bash
# From monorepo root
pnpm install
```

### Running the Application

```bash
# From monorepo root (runs all apps)
pnpm dev

# Or from this directory
cd apps/web
pnpm dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### Building

```bash
# Build all packages and apps
pnpm build

# Or build just this app
cd apps/web
pnpm build
```

## Development

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode

### Environment Variables

Optional environment variables (see `.env-example`):

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Sentry environment name

## Project Structure

```
apps/web/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── providers.tsx      # App providers (nuqs, next-themes)
│   └── error-boundary.tsx # Error boundary component
├── lib/                   # Utilities
│   └── env.ts            # Environment variable validation
└── package.json          # Dependencies and scripts
```

## Providers

The app uses two main providers:

- **NuqsAdapter** - URL state management for query parameters
- **NextThemesProvider** - Theme management (light/dark mode)

See `components/providers.tsx` for the provider setup.

## Related Documentation

- [Monorepo Structure](../../apps/docs/content/docs/architecture/monorepo.mdx) - Package organization
- [Frontend Stack](../../apps/docs/content/docs/architecture/frontend-stack.mdx) - Next.js and Shadcn/ui
- [Package Conventions](../../apps/docs/content/docs/architecture/package-conventions.mdx) - Package architecture
