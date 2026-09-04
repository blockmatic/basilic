# Product First

## Principle

Define what you are building, for whom, why it is worth building, and how you will know — before implementation becomes the specification.

## Statement

I do not let the codebase become the product brief. Before I change meaningful behavior, I want a file that names the problem, who has it, why it is worth building, what we are not building, how it reaches people, and how we will know. Implementation can reveal a better option. It should not invent the goal.

## Outcome

The project has an inspectable answer to what, why, and how we will know. Non-goals, GTM, success metrics, and the tracking plan are written or explicitly unresolved. Named metrics have events, or are marked unmeasured. When the product is a business, market size and unit economics are stated as measured or as hypotheses.

## Artifacts

- **Fact:** Canonical product brief: [product/index.mdx](../../apps/docu/content/docs/product/index.mdx) and [product/features.mdx](../../apps/docu/content/docs/product/features.mdx)
- **Fact:** [`../../README.md`](../../README.md) — fork-and-run TypeScript fullstack starter (Fastify, OpenAPI, Next, Expo scaffold). No Wagmi, no first-class OpenAI SDK, no web wallet UI
- **Fact:** [`../../apps/docu/content/docs/index.mdx`](../../apps/docu/content/docs/index.mdx) — toolkit intro; Product is in the docs nav
- **Fact:** Two audiences: **adopters** (developers using the starter) and **demo users** (web markets `/`, headlines strip, settings, in-shell assistant; auth is the shipped job)
- **Fact:** GTM: clone + [Getting Started](../../apps/docu/content/docs/development/index.mdx) + first local login. Finance **N/A** (toolkit)
- **Fact:** Owner: Gabo Esquivel (named on product index)
- **Fact:** New-device sign-in alerts are transactional email via Fastify `emailProvider` + `@repo/email`, not a notification product
- **Fact:** Not a billed SaaS in files. Do not invent TAM/LTV
- **Fact:** Non-goals: mobile not an API client; no web wallet UI; Cache Components off; `@repo/react` hooks handwritten; PostHog not installed; Sentry inactive
- **Fact:** PostHog **chosen, not installed**. Product events are **specified** in types + [analytics.mdx](../../apps/docu/content/docs/architecture/analytics.mdx) and **instrumented** via `apps/web/lib/analytics.ts` `capture()`. They are **not collected** and therefore **not measured**
- **Fact:** Two demo questions are specified: (1) auth — `auth_succeeded` / `auth_failed` by `method`; (2) assistant — `__render: 'user-info'` (`assistant_turn` with `accountRender`). Unmeasured
- **Fact:** PD (Markets + GenAI artifacts) is shipped on the feature map: CoinGecko or mock, `getMarketSnapshot` / `market-card`
- **Unresolved:** PostHog install / consent / retention; keep / iterate / kill board; whether adopters copy `lib/analytics`

`pnpm qa` going green is Quality/Pipelines, not product success.

## Minimum Useful Artifact

- problem: bootstrap a typed API + web/mobile/docs without inventing the stack
- users: adopting developers; demo end users on web auth and dashboard
- goal: portable starter with self-hosted Web2 auth and Cursor-first workflow (Web3 on API only)
- non-goals: [product/index.mdx](../../apps/docu/content/docs/product/index.mdx) R0 list
- audience/channel/first use: clone + Getting Started + first local login
- metrics: auth and assistant jobs **instrumented, not collected**
- events: `auth_succeeded`, `auth_failed`, `assistant_turn` — specified + instrumented, no sink
- owners: Gabo Esquivel

## Recipe

1. Inspect README, docs index, analytics ADR, issues, running web/API, and claimed metrics.
2. Understand shipped vs claimed (starter vs product, GTM, measurement).
3. Identify missing users, missing goal, success that cannot fail, named metrics with no events.
4. Propose the smallest useful update to a durable product artifact in `apps/docu` or README — not a parallel fake PRD.
5. Make decisions explicit, or name them unresolved. Do not hide them in code.
6. When a change can move a metric, ship the event in the same work — or mark unmeasured.
7. After use, compare metric to target and record keep / iterate / kill — when metrics exist.
8. Update durable artifacts and this instance if the bet, GTM, or analytics changed.

## Validation

- A new contributor can answer what we are building from `apps/docu` Product pages + README without `__dev/`
- Success metrics can fail. They are not CI green. Auth/assistant remain unmeasured (no sink)
- GTM is clone + Getting Started. Finance N/A
- No silent product decisions in code without a note or open question

## Definition of Done

Product intent is documented or explicitly deferred with named owners. Implementation aligns with stated goals and non-goals, or the docs were updated. Success that was claimed is either instrumented or marked unmeasured.

## Agent Prompt

Apply Product First to Basilic.

Read root README, `apps/docu/content/docs/product/`, analytics MDX and ADR 011, and what the web, mobile, and API actually do. PostHog is not installed. `capture()` is a no-op — do not claim events are collected or measured. PD is named on the feature map, not shipped.

Preserve intentional existing product choices. Do not silently decide scope, priorities, pricing, TAM, LTV, or event names. This is a toolkit — say so rather than filling finance blanks.

Separate `pnpm qa` from post-launch success. Propose the smallest useful update to Product MDX or README. Update this instance when paths or unresolved items change.

## Notes

**Product vs Journeys:** Product names what, why, and how we will know. Journeys name how someone finishes.

**Product vs Quality:** Product names the outcome after use. Quality names the bar that gates a release.

**Product vs Operations:** Product owns events, funnels, activation. Operations owns logs, traces, error rates, alerts, recovery.

**Product vs Data:** Product names events and outcomes to measure. Data owns canonical domain meaning, authority, lifecycle, and evolution.

**Navigation:** [Generic spec](../principles/PRODUCT.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/PRODUCT.md) · [Factory map](../ABOUT.md) · [Product](../../apps/docu/content/docs/product/index.mdx) · [Feature map](../../apps/docu/content/docs/product/features.mdx) · [ADR 011](../../apps/docu/content/docs/adrs/011-product-analytics.mdx)
