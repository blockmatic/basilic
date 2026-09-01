# Web App

Next.js 16 dashboard for the Basilic stack: news, markets, settings, and AI assistant chrome. Uses `@repo/core` and `@repo/react` against the Fastify API.

## Tech Stack

- **Next.js** 16.3.3 — App Router, RSC-first
- **React** 19 — UI
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first CSS
- **Shadcn/ui** — Component library (via `@repo/ui`)
- **next-themes** — Theme provider for dark mode
- **nuqs** — URL state management

## Monorepo Integration

- **`@repo/ui`** — Shared UI components and design system
- **`@repo/core`** — Generated API client and types
- **`@repo/react`** — TanStack Query hooks for API calls

See the [monorepo documentation](@apps/docu/content/docs/architecture/monorepo.mdx) for package architecture.

## Getting Started

### Prerequisites

- **Node.js** 24.x (LTS Krypton)
- **pnpm** 11.24.0

### Installation

```bash
# From monorepo root
pnpm install
```

### Running the Application

**Recommended: From monorepo root** (runs all apps with watch mode):

```bash
pnpm dev
```

This starts the Fastify API, Next.js frontend, and package watchers.

**Alternative: Run directly** (build dependencies first):

```bash
pnpm build --filter=@repo/core --filter=@repo/react --filter=@repo/error --filter=@repo/utils
cd apps/web
pnpm dev
```

The application is available at `http://localhost:3000`.

### Building

```bash
pnpm build --filter=@repo/web
```

## Development

### Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint
- `pnpm test` — No-op (E2E only)
- `pnpm test:e2e:local` — Build, spawn servers, run E2E, cleanup

See [E2E Testing](@apps/docu/content/docs/testing/e2e-testing.mdx) for full details.

### Environment Variables

See `.env.local.example` (copy to `.env.local`) and `lib/env.ts`.

## Project Structure

```
apps/web/
├── app/
│   ├── api/auth/          # Cookie update routes (update-tokens)
│   ├── auth/              # Callbacks (magiclink, oauth, web3), logout
│   └── (dashboard)/       # Authenticated routes
├── app/providers.tsx      # QueryClient, ApiProvider, createClient (JWT mode)
├── lib/auth/              # auth-client, auth-server, jwt-utils
├── lib/env.ts             # Environment validation
└── proxy.ts               # Auth gate and token refresh on navigation
```

## Providers

- **QueryClientProvider** — per-tree TanStack Query client
- **ApiProvider** — `@repo/react` with JWT auth from `createClient`
- **NuqsAdapter** — URL state
- **NextThemesProvider** — light/dark mode

See `app/providers.tsx`.

## Authentication

Auth callbacks exchange credentials with Fastify and set the `api.session` cookie. Clients call Fastify directly; Next.js routes exist for cookie integration only.

See [Authentication Architecture](@apps/docu/content/docs/architecture/authentication.mdx).

## Testing

Playwright E2E only (`e2e/**/*.spec.ts`). See [E2E Testing](@apps/docu/content/docs/testing/e2e-testing.mdx).

## Related Documentation

- [Monorepo Structure](@apps/docu/content/docs/architecture/monorepo.mdx)
- [Frontend Architecture](@apps/docu/content/docs/architecture/frontend.mdx)
