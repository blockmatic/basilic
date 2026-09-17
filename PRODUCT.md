# Product

Basilic is an **API-First AI TypeScript FullStack Starter** (fork-and-run toolkit): Fastify + OpenAPI, Next.js, Expo scaffold, a shared `AGENTS.md` agent contract (workflow playbooks and skills; Cursor slash/MCP are adapters), and a thin web demo that proves auth and the API. It is not a billed SaaS. Do not invent TAM or LTV.

Owner until this file says otherwise: **Gabo Esquivel**.

Technical docs for adopters live in [`apps/docu/content/docs/`](apps/docu/content/docs/). Visual language: [`DESIGN.md`](DESIGN.md). Tokens: [`packages/ui/src/styles/tokens.css`](packages/ui/src/styles/tokens.css). `__dev/` is gitignored scratch — not the backlog. Work items live in [GitHub Issues](https://github.com/blockmatic/basilic/issues). There is no `BACKLOG.md`.

`pnpm qa` going green is local/CI evidence, not product success. The R0 bar is [Product Ready](apps/docu/content/docs/testing/product-ready.mdx).

## Two audiences

**Adopters** run `npx create-basilic@latest my-app` (or clone / GitHub **Use this template**), run the stack locally, and copy patterns. First successful use is [Product Ready](apps/docu/content/docs/testing/product-ready.mdx): generate or clone → [Getting Started](apps/docu/content/docs/development/index.mdx) (`db:start`, `pnpm reset`, `pnpm dev`) → `ALLOW_TEST` + `test@test.ai` to `/`. After they own the copy: [After fork](apps/docu/content/docs/development/after-fork.mdx). Forks remain the path to contribute to Basilic.

**Demo users** sign in to the web app. The shipped job is auth (sessions, API keys, settings). Markets, a headlines strip, and the in-shell assistant are demo chrome. See Feature map below.

Actors: web end user; adopting developer; CLI/agent with API key; CI/CodeRabbit/DeepSec; mobile user (**deferred**). Named journey files beyond auth MDX, and mobile as a completed product surface, are unresolved.

## Goal

A portable typed API plus web, mobile scaffold, and docs so an adopting developer does not invent the stack. Self-hosted Web2 auth is the spine. Web3 auth exists on Fastify; the web app has **no wallet UI**.

New-device sign-in alerts are transactional email via Fastify `emailProvider` + `@repo/email`, not a notification product.

## Non-goals (R0)

- Wallet connect UI, Wagmi, or a Solana adapter in `apps/web`
- Mobile as an `@repo/core` API client
- Installing PostHog or turning Sentry on
- Next.js Cache Components on
- First-class OpenAI SDK (chat uses Anthropic → OpenRouter → Ollama)
- GCP/AWS as the shipped deploy path (Vercel + Supabase is documented)
- Billed SaaS metrics

## How we will know

Auth (`auth_succeeded` / `auth_failed`) and assistant (`assistant_turn` with `accountRender`) are **instrumented** via `capture()` and **not collected** — PostHog is chosen, not installed. Those jobs are therefore **unmeasured**. GTM, demo surface quality, and cost-per-job are unmeasured.

Finance: **N/A** (toolkit).

**Unresolved:** PostHog install / consent / retention; keep / iterate / kill board; whether adopters copy `lib/analytics`.

## Feature map

Status is what the tree does today, not a wish list. Horizons: Roadmap below.

### Spine (fork-and-run)

Must work after `npx create-basilic@latest` (or clone) → `pnpm setup` → `db:start` → `pnpm reset` → `pnpm dev`.

- Fastify TypeBox API → generated OpenAPI → `@repo/core` / handwritten `@repo/react`
- **create-basilic** generator (`tools/create-basilic`) — new products; forks stay for upstream contributions
- Auth: magic link (Resend **or** copied local `ALLOW_TEST=true` + `test@test.ai`) → cookies → `/`
- Optional OAuth (unconfigured = disabled / 503)
- Passkeys, sessions, API keys `bask_`, Settings profile and security
- Next 16 web app gated by `apps/web/proxy.ts`
- Docs site (`apps/docu`), `AGENTS.md` / harness stubs, basilic-skills playbooks, Cursor glob rules as adapters
- `@repo/ui` tokens in `packages/ui/src/styles/tokens.css`
- `@repo/email` for auth mail; CLI with API key only
- Pino `reqId`; `GET /health` readiness (503 when DB probe fails)

### Demo chrome

- Markets home (`/`) — CoinGecko public prices or a checked-in sample board (no CoinGecko key)
- Headlines strip — NewsAPI or a one-line empty state
- In-shell assistant — `getAccountInfo` / `__render: 'user-info'` and `getMarketSnapshot` / `__render: 'market-card'` (Ollama is the free local path)

### Shipped in API or packages, not in web UX

- Web3 SIWE/SIWS + Next `/auth/callback/web3` — **no wallet connect UI, no Wagmi**
- `@repo/utils/web3` chain metadata and RPC helpers
- Link-email API and `@repo/react` hooks — **no web UI** (change-email exists in Settings)

### Scaffold or inactive

- Expo UI scaffold — not an API client
- `capture()` analytics — specified and instrumented, not collected (PostHog not installed)
- Sentry packages — installed, inactive
- Ollama provider — real, not the default when Anthropic or OpenRouter is set

### PD (shipped)

Signed-in demo is **Markets + GenAI artifacts**: CoinGecko or mock, `getMarketSnapshot` + market-card catalog, `getAccountInfo` kept. No wallet UI. No Fastify markets CRUD. No extra CI workflow. News is a supporting headlines strip.

## Roadmap

Horizons, not a sprint board.

R0 is **documentation alignment**. It does not need a semver bump or a GitHub Release. CI still runs on PRs; Quality is [Product Ready](apps/docu/content/docs/testing/product-ready.mdx).

### R0 — docs, honesty, onboarding

- This file: what Basilic is, feature map, this roadmap
- Honesty in README and auth docs (starter, not wallet/OpenAI template)
- MIT `LICENSE`; GitHub Template; [After fork](apps/docu/content/docs/development/after-fork.mdx)
- [Product Ready](apps/docu/content/docs/testing/product-ready.mdx): `db:start` + `pnpm reset` before `pnpm dev`; copied env `ALLOW_TEST=true`

### R-launch — generator and distribution

- `npx create-basilic@latest` ships an independent API/web/mobile repo (no docu app, no generator)
- Release Please versions Basilic; maintainer merge publishes the npm tarball
- Stable **1.0.0** only after Product Ready from the published package
- Human gates: npm `create-basilic` trusted publisher, GitHub App, squash `PR_TITLE`+`PR_BODY`, who may merge release PRs

### R-demo — Markets + GenAI artifacts

Named even if the implementation PR is still in flight: CoinGecko or checked-in mock, `getMarketSnapshot` + market-card catalog, Markets as signed-in home. No wallet UI. No Fastify markets CRUD. No extra CI workflow. See Feature map above.

### Later (ask before R0)

Tracked as issues. Do not treat them as committed R1.

- PostHog install — [#183](https://github.com/blockmatic/basilic/issues/183)
- Turn Sentry on — [#184](https://github.com/blockmatic/basilic/issues/184)
- Wallet connect UI — [#185](https://github.com/blockmatic/basilic/issues/185)
- Mobile `@repo/core` client — [#186](https://github.com/blockmatic/basilic/issues/186)

R1 is still a choice among wallet UI, mobile client, and observability — not all three.

### Not now

Billed SaaS / TAM-LTV, first-class OpenAI SDK, GCP/AWS as the shipped deploy path, Cache Components on, a second product brief or `ROADMAP.md`.
