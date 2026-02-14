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

See the [monorepo documentation](@apps/docu/content/docs/architecture/monorepo.mdx) for details on package architecture.

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

**Recommended: From monorepo root** (runs all apps with watch mode):

```bash
# From monorepo root
pnpm dev
```

This starts all development servers including:
- Fastify API server (with OpenAPI generation)
- Next.js frontend (this app)
- Package watchers for automatic rebuilds

**Alternative: Run directly** (requires building dependencies first):

```bash
# Build required packages first
pnpm build --filter=@repo/core --filter=@repo/react --filter=@repo/sentry --filter=@repo/utils

# Then run from this directory
cd apps/next
pnpm dev
```

**Note**: When running directly, you must rebuild dependencies (`@repo/core`, `@repo/react`, `@repo/sentry`, `@repo/utils`) whenever they change. Using `pnpm dev` from the root handles this automatically with watch mode.

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
- `pnpm test` - Run component tests (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:e2e` - Run E2E tests (Playwright; expects URLs via env or `--app`/`--api` params)
- `pnpm test:e2e:local` - Build, spawn servers, run E2E, cleanup (recommended for local/CI)
- `pnpm start:e2e:servers` - Start Fastify + Next for manual E2E; run `pnpm test:e2e` in another terminal (run `pnpm build:e2e` first)
- `pnpm test:e2e:ui` - Run E2E with Playwright UI
- `pnpm test:e2e:debug` - Debug E2E tests

See [E2E Testing](@apps/docu/content/docs/testing/e2e-testing.mdx) for full details.

### Environment Variables

Optional environment variables (see `.env-example`):

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

The app uses the following providers:

- **QueryClientProvider** - TanStack Query for data fetching and caching
- **ReactApiProvider** - API client context from `@repo/react` with auth token injection
- **NuqsAdapter** - URL state management for query parameters
- **NextThemesProvider** - Theme management (light/dark mode)

See `components/providers.tsx` for the provider setup.

## Authentication

This app implements a Backend-for-Frontend (BFF) pattern for authentication:

**BFF Auth Proxy** (`app/api/auth/[...path]/route.ts`):
- Proxies authentication requests to Fastify API
- Stores JWT tokens in HttpOnly cookies (secure, XSS-protected)
- Automatically injects `Authorization: Bearer` headers in API requests
- Handles magic link verification and token storage

**Authentication Flow:**
1. User clicks magic link from email
2. Next.js BFF fetches JWT from Fastify (`format=jwt`)
3. BFF stores JWT in HttpOnly cookie
4. Server Components and API routes read cookie and inject bearer header
5. Fastify validates bearer token and resolves to session

See [Authentication Architecture](@apps/docu/content/docs/architecture/authentication.mdx) for complete details.

## Testing

This app uses multiple testing approaches:

- **Component Tests** (`**/*.spec.tsx`): Vitest with Testing Library - UI-focused tests that may use `fetchMock` for performance
- **E2E Tests** (`e2e/**/*.spec.ts`): Playwright - Full integration tests using real Fastify server and Next.js server

**E2E Test Setup:**

E2E tests automatically start both servers:
- Fastify API server on port 3001 (dev mode locally, start mode in CI)
- Next.js frontend on port 3000

Tests wait for both servers to be ready before running. All E2E tests use real infrastructure - no mocks.

See [Frontend Testing Documentation](@apps/docu/content/docs/testing/frontend-testing.mdx) for complete testing patterns and examples.

## Vercel Deployment

This app includes a `vercel.json` configuration file. If deploying to Vercel:

1. **Root Directory**: Set the root directory to `apps/next` in Vercel project settings
2. **Build Command**: Should be `cd ../.. && pnpm build --filter=@repo/next` (configured in `vercel.json`)
3. **Install Command**: Should be `cd ../.. && pnpm install` (configured in `vercel.json`)

**Important**: If you see build errors about a package named "mathler" or any other incorrect filter, check your Vercel project settings and ensure they match the `vercel.json` configuration. Vercel project settings override `vercel.json`, so make sure they're aligned.

## CI & Builds

- **Unit tests** — Run on PR when `apps/next` or its dependencies change (path-filtered)
- **E2E tests** — Run after Vercel deployment succeeds (`repository_dispatch`). Project name must contain `basilic-next` for the workflow to match

## Related Documentation

- [Monorepo Structure](@apps/docu/content/docs/architecture/monorepo.mdx) - Package organization
- [Frontend Stack](@apps/docu/content/docs/architecture/frontend-stack.mdx) - Next.js and Shadcn/ui
- [Package Conventions](@apps/docu/content/docs/architecture/package-conventions.mdx) - Package architecture
