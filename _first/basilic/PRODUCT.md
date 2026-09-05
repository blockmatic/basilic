# Product First

## Principle

Define what you are building, for whom, why it is worth building, and how you will know — before implementation becomes the specification.

## Statement

I do not let the codebase become the product brief. Before I change meaningful behavior, I want a file that names the problem, who has it, why it is worth building, what we are not building, how it reaches people, and how we will know. Implementation can reveal a better option. It should not invent the goal.

## Outcome

The project has an inspectable answer to what, why, and how we will know. Non-goals, GTM, success metrics, and the tracking plan are written or explicitly unresolved. Named metrics have events, or are marked unmeasured. When the product is a business, market size and unit economics are stated as measured or as hypotheses.

## Artifacts

- **Fact:** This file is the canonical product brief (Brief, Feature map, Roadmap below). Do not put Basilic intent, feature map, or horizons in `apps/docu`
- **Fact:** [`../../README.md`](../../README.md) — MIT fork-and-run TypeScript fullstack starter (Fastify, OpenAPI, Next, Expo scaffold). No Wagmi, no first-class OpenAI SDK, no web wallet UI
- **Fact:** [`../../apps/docu/content/docs/`](../../apps/docu/content/docs/) — adopter technical docs (architecture, ADRs, development, testing, deployment). Not a product site
- **Fact:** Two audiences: **adopters** (developers using the starter) and **demo users** (web markets `/`, headlines strip, settings, in-shell assistant; auth is the shipped job)
- **Fact:** GTM: clone or GitHub **Use this template** + [Getting Started](../../apps/docu/content/docs/development/index.mdx) (`db:start`, `pnpm reset`) + first local login (`ALLOW_TEST` + `test@test.ai`). Bar: [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx). After you own the copy: [After fork](../../apps/docu/content/docs/development/after-fork.mdx). Finance **N/A** (toolkit)
- **Fact:** Owner: Gabo Esquivel
- **Fact:** New-device sign-in alerts are transactional email via Fastify `emailProvider` + `@repo/email`, not a notification product
- **Fact:** Not a billed SaaS in files. Do not invent TAM/LTV
- **Fact:** Non-goals: mobile not an API client; no web wallet UI; Cache Components off; `@repo/react` hooks handwritten; PostHog not installed; Sentry inactive
- **Fact:** PostHog **chosen, not installed**. Product events are **specified** in types + [analytics.mdx](../../apps/docu/content/docs/architecture/analytics.mdx) and **instrumented** via `apps/web/lib/analytics.ts` `capture()`. They are **not collected** and therefore **not measured**
- **Fact:** Two demo questions are specified: (1) auth — `auth_succeeded` / `auth_failed` by `method`; (2) assistant — `__render: 'user-info'` (`assistant_turn` with `accountRender`). Unmeasured
- **Fact:** PD (Markets + GenAI artifacts) is shipped on the feature map: CoinGecko or mock, `getMarketSnapshot` / `market-card`
- **Unresolved:** PostHog install / consent / retention; keep / iterate / kill board; whether adopters copy `lib/analytics`

`pnpm qa` going green is Pipelines, not product success. Quality for R0 is [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx).

## Minimum Useful Artifact

- problem: bootstrap a typed API + web/mobile/docs without inventing the stack
- users: adopting developers; demo end users on web auth and dashboard
- goal: portable starter with self-hosted Web2 auth and Cursor-first workflow (Web3 on API only)
- non-goals: Brief → Non-goals (R0) in this file
- audience/channel/first use: clone or Use this template + Getting Started (`db:start`, `pnpm reset`) + first local login (`ALLOW_TEST` + `test@test.ai`) ([Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx))
- metrics: auth and assistant jobs **instrumented, not collected**
- events: `auth_succeeded`, `auth_failed`, `assistant_turn` — specified + instrumented, no sink
- owners: Gabo Esquivel

## Recipe

1. Inspect README, this file, analytics ADR, issues, running web/API, and claimed metrics.
2. Understand shipped vs claimed (starter vs product, GTM, measurement).
3. Identify missing users, missing goal, success that cannot fail, named metrics with no events.
4. Propose the smallest useful update to this file or README — not a parallel fake PRD, not `apps/docu` Product pages.
5. Make decisions explicit, or name them unresolved. Do not hide them in code.
6. When a change can move a metric, ship the event in the same work — or mark unmeasured.
7. After use, compare metric to target and record keep / iterate / kill — when metrics exist.
8. Update this file if the bet, GTM, feature map, or analytics changed.

## Validation

- A new maintainer can answer what we are building from this file + README without `__dev/` or Fumadocs Product pages
- Success metrics can fail. They are not CI green. Auth/assistant remain unmeasured (no sink)
- GTM is clone or Use this template + Getting Started. Product Ready is that path, not CI green. Finance N/A
- No silent product decisions in code without a note or open question

## Definition of Done

Product intent is documented or explicitly deferred with named owners. Implementation aligns with stated goals and non-goals, or this file was updated. Success that was claimed is either instrumented or marked unmeasured.

## Agent Prompt

Apply Product First to Basilic.

Read root README, this file, analytics MDX and ADR 011, and what the web, mobile, and API actually do. PostHog is not installed. `capture()` is a no-op — do not claim events are collected or measured. PD is shipped on the feature map.

Preserve intentional existing product choices. Do not silently decide scope, priorities, pricing, TAM, LTV, or event names. This is a toolkit — say so rather than filling finance blanks.

Separate `pnpm qa` from post-launch success. Propose the smallest useful update to this file or README. Do not write Basilic product intent into `apps/docu`.

## Notes

**Product vs Journeys:** Product names what, why, and how we will know. Journeys name how someone finishes.

**Product vs Quality:** Product names the outcome after use. Quality names the bar that gates a release.

**Product vs Operations:** Product owns events, funnels, activation. Operations owns logs, traces, error rates, alerts, recovery.

**Product vs Data:** Product names events and outcomes to measure. Data owns canonical domain meaning, authority, lifecycle, and evolution.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/PRODUCT.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/PRODUCT.md) · [Factory map](../ABOUT.md) · [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx) · [Analytics](../../apps/docu/content/docs/architecture/analytics.mdx) · [ADR 011](../../apps/docu/content/docs/adrs/011-product-analytics.mdx)

## Brief

Basilic is a **developer starter** (fork-and-run toolkit): Fastify + OpenAPI, Next.js, Expo scaffold, Cursor workflow, and a thin web demo that proves auth and the API. It is not a billed SaaS. Do not invent TAM or LTV.

Owner until this file says otherwise: **Gabo Esquivel**.

### Two audiences

**Adopters** clone the repo or use GitHub **Use this template**, run the stack locally, and copy patterns. First successful use is [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx): clone → [Getting Started](../../apps/docu/content/docs/development/index.mdx) (`db:start`, `pnpm reset`, `pnpm dev`) → `ALLOW_TEST` + `test@test.ai` to `/`. After they own the copy: [After fork](../../apps/docu/content/docs/development/after-fork.mdx).

**Demo users** sign in to the web app. The shipped job is auth (sessions, API keys, settings). Markets, a headlines strip, and the in-shell assistant are demo chrome. See Feature map below.

### Goal

A portable typed API plus web, mobile scaffold, and docs so an adopting developer does not invent the stack. Self-hosted Web2 auth is the spine. Web3 auth exists on Fastify; the web app has **no wallet UI**.

### Non-goals (R0)

- Wallet connect UI, Wagmi, or a Solana adapter in `apps/web`
- Mobile as an `@repo/core` API client
- Installing PostHog or turning Sentry on
- Next.js Cache Components on
- First-class OpenAI SDK (chat uses Anthropic → OpenRouter → Ollama)
- GCP/AWS as the shipped deploy path (Vercel + Supabase is documented)
- FIRST CLI, `first.json`, or a 13th FIRST station. `npx skills add blockmatic/first` (`/f-*`) is in; do not ship a skill that mixes spec and instance
- Billed SaaS metrics

### How we will know

`pnpm qa` going green is **Pipelines**, not product success. The R0 Quality bar is [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx). Horizons: Roadmap below.

Auth (`auth_succeeded` / `auth_failed`) and assistant (`assistant_turn` with `accountRender`) are **instrumented** via `capture()` and **not collected** — PostHog is chosen, not installed. Those jobs are therefore **unmeasured**. Factory GTM, demo surface quality, and cost-per-job are unmeasured.

Finance: **N/A** (toolkit).

## Feature map

Status is what the tree does today, not a wish list. Horizons: Roadmap below.

### Spine (fork-and-run)

Must work after clone → `pnpm setup` → `db:start` → `pnpm reset` → `pnpm dev`.

- Fastify TypeBox API → generated OpenAPI → `@repo/core` / handwritten `@repo/react`
- Auth: magic link (Resend **or** copied local `ALLOW_TEST=true` + `test@test.ai`) → cookies → `/`
- Optional OAuth (unconfigured = disabled / 503)
- Passkeys, sessions, API keys `bask_`, Settings profile and security
- Next 16 web app gated by `apps/web/proxy.ts`
- Docs site (`apps/docu`), Cursor rules, basilic-skills playbooks
- `@repo/ui` tokens in `packages/ui/src/styles/tokens.css`
- `@repo/email` for auth mail; CLI with API key only
- Pino `reqId`; `GET /health` `{ ok, dbReady }`

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

Horizons, not a sprint board. Work items live in [GitHub Issues](https://github.com/blockmatic/basilic/issues). `__dev/` is gitignored scratch — not Fact, not the backlog.

R0 is **documentation alignment**. It does not need a semver bump or a GitHub Release. Pipelines still run on PRs; Quality is [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx).

### R0 — docs, honesty, onboarding

- This file: what Basilic is, feature map, this roadmap
- Honesty in README and auth docs (starter, not wallet/OpenAI template)
- MIT `LICENSE`; GitHub Template; [After fork](../../apps/docu/content/docs/development/after-fork.mdx)
- [Product Ready](../../apps/docu/content/docs/testing/product-ready.mdx): `db:start` + `pnpm reset` before `pnpm dev`; copied env `ALLOW_TEST=true`

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

FIRST CLI, `first.json`, billed SaaS / TAM-LTV, first-class OpenAI SDK, GCP/AWS as the shipped deploy path, Cache Components on, 13th FIRST station, root `PRODUCT.md` / `ROADMAP.md`. `/f` via `npx skills add blockmatic/first` is in.
