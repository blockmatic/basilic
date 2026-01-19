# Web App

A Next.js application in this monorepo. This is a minimal hello world application demonstrating the integration of Next.js with the monorepo architecture.

## Tech Stack

- **Next.js** 16.0.3 - React framework with App Router
- **React** 19.2.3 - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Component library (via `@repo/ui`)
- **next-themes** - Theme provider for dark mode
- **nuqs** - URL state management

## Monorepo Integration

This app uses shared packages from this monorepo:

- **`@repo/ui`** - Shared UI components and design system
- **`@repo/core`** - API client and types (for future API integration)
- **`@repo/react`** - React Query hooks (for future API integration)

See the [monorepo documentation](@apps/docu/content/docs/core-concepts/monorepo-structure.mdx) for details on package architecture.

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
cd apps/next
pnpm dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### Building

```bash
# Build all packages and apps
pnpm build

# Or build just this app
cd apps/next
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
apps/next/
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

## Vercel Deployment

This app includes a `vercel.json` configuration file. If deploying to Vercel:

1. **Root Directory**: Set the root directory to `apps/next` in Vercel project settings
2. **Build Command**: Should be `cd ../.. && pnpm build --filter=@repo/next` (configured in `vercel.json`)
3. **Install Command**: Should be `cd ../.. && pnpm install` (configured in `vercel.json`)

**Important**: If you see build errors about a package named "mathler" or any other incorrect filter, check your Vercel project settings and ensure they match the `vercel.json` configuration. Vercel project settings override `vercel.json`, so make sure they're aligned.

## Related Documentation

- [Monorepo Structure](@apps/docu/content/docs/core-concepts/monorepo-structure.mdx) - Package organization
- [Frontend Stack](@apps/docu/content/docs/architecture/frontend-stack.mdx) - Next.js and Shadcn/ui
- [Package Conventions](@apps/docu/content/docs/architecture/package-conventions.mdx) - Package architecture
