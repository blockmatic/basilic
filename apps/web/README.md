# Web App

In-box **coin tracker** sample (not Markets, not a signer). **J1:** cached `GET /coins` (fixture if vendors are down) and chips with no LLM. **J2:** Commands type or talk → generated table, chart, account, or dashboard; GET restores `elements` with no model. Chat is an eve transcript, not nav. Live CoinGecko Demo boards keep CoinGecko attribution.

Next.js 16 dashboard for the Basilic stack: signed-in home is a json-render `Renderer` on the coin island (`GET /coins` + nuqs `SearchQuery` + `surface` / `elements` / chrome). Share copies the current `/` href. `surface=account` is catalog UserInfo plus this JWT’s watchlist, TokenTable, and NftGrid from `GET /account/wallet`. `surface=chart` is Line/Area/Bar recipes bound to `$state.series` from `GET /coins/:assetId/candles`. `surface=dashboard` is ephemeral overview widgets (`$state.global` from `GET /coins/global`, `$state.trending` from `GET /coins/trending`, plus a table). The catalog lives in `lib/genui`; `components/genui` maps names to `@repo/ui`. Typed Commands send to the eve **command** agent through **`useEveAgent` (`eve/react`)** (`GET /agents` for `host`, Bearer `headers`), then Next `composeBoardSpec` when `AI_GATEWAY_API_KEY` is set; otherwise `composeSurface`. Composer can dictate into the same input; full dictation behavior is in [Frontend Architecture](../docu/content/docs/architecture/frontend.mdx). Chat tab uses a second `useEveAgent` against eve **chat** (`https://agents.basilic.localhost/eve/chat`; `pnpm --filter @repo/agents eve:dev:chat`); it does not compose or call Fastify `/ai/generate`. Do not import `eve/client` into Next. Uses `@repo/core` and `@repo/react` against the Fastify API. From the monorepo root: `pnpm db:start`, then `pnpm dev` (Turbo TUI includes web, API, and eve command/chat). See [Product Ready](../docu/content/docs/testing/product-ready.mdx).

## Tech Stack

- **Next.js** 16.3.5 — App Router, RSC-first
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

See the [monorepo documentation](../docu/content/docs/architecture/monorepo.mdx) for package architecture.

## Getting Started

### Prerequisites

- **Node.js** 24.x (LTS Krypton)
- **pnpm** 12.4.2

### Installation

```bash
# From monorepo root
pnpm setup
```

See [Getting Started](https://basilic-docs.vercel.app/docs/development).

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

The application is available at `https://basilic.localhost`. Direct Next: `pnpm --filter @repo/web dev:app`.

### Building

```bash
pnpm build --filter=@repo/web
```

## Development

### Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm lint` — Run Biome and ESLint
- `pnpm test` — Vitest for `lib/**/*.test.ts`, including compose helpers and speech merge
- `pnpm test:e2e:local` — Build, spawn servers, run E2E, cleanup

See [E2E Testing](../docu/content/docs/testing/e2e-testing.mdx) for full details.

### Environment Variables

See `.env.local.example` (copy to `.env.local`) and `lib/env.ts`. Optional `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` enables WalletConnect-only rows in the login modal. Optional server `AI_GATEWAY_API_KEY` enables composeSpec on Commands Send; unset keeps `composeSurface`.

## Project Structure

```text
apps/web/
├── app/
│   ├── api/auth/          # Cookie update routes (update-tokens)
│   ├── auth/              # Callbacks (magiclink, oauth, web3), logout
│   └── (dashboard)/       # Authenticated routes
├── app/providers.tsx      # QueryClient, WagmiProvider, ApiProvider
├── lib/auth/              # auth-client, auth-server, jwt-utils
├── lib/analytics.ts       # typed capture() — no-op sink
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

Product events (`capture` in `lib/analytics.ts`) are typed no-ops — instrumented, not collected. See [Product analytics](../docu/content/docs/architecture/analytics.mdx).

See [Authentication Architecture](../docu/content/docs/architecture/authentication.mdx).

## Testing

Playwright E2E (`e2e/**/*.spec.ts`) plus compose Vitest beside `lib/genui`. See [E2E Testing](../docu/content/docs/testing/e2e-testing.mdx).

## Related Documentation

- [Monorepo Structure](../docu/content/docs/architecture/monorepo.mdx)
- [Frontend Architecture](../docu/content/docs/architecture/frontend.mdx)
- [Product analytics](../docu/content/docs/architecture/analytics.mdx)
