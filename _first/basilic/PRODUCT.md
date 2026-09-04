# Product First

## Principle

Define what you are building, for whom, why it is worth building, and how you will know — before implementation becomes the specification.

## Statement

I do not let the codebase become the product brief. Before I change meaningful behavior, I want a file that names the problem, who has it, why it is worth building, what we are not building, how it reaches people, and how we will know. Implementation can reveal a better option. It should not invent the goal.

## Outcome

The project has an inspectable answer to what, why, and how we will know. Non-goals, GTM, success metrics, and the tracking plan are written or explicitly unresolved. Named metrics have events, or are marked unmeasured. When the product is a business, market size and unit economics are stated as measured or as hypotheses.

## Artifacts

- **Fact:** [`../../README.md`](../../README.md) — API-first TypeScript fullstack starter (Fastify, OpenAPI, Next, Expo)
- **Fact:** [`../../apps/docu/content/docs/index.mdx`](../../apps/docu/content/docs/index.mdx) — toolkit intro
- **Fact:** Two audiences: **adopters** (developers using the starter) and **demo users** (web news `/`, markets, settings, in-shell assistant; auth is the shipped job)
- **Fact:** New-device sign-in alerts are transactional email via Fastify `emailProvider` + `@repo/email`, not a notification product
- **Fact:** Not a billed SaaS in files. No `PRODUCT.md` / PRD. Do not invent one to fill TAM.
- **Fact:** Observed non-goals in code/docs: mobile not an API client; no web wallet UI; Cache Components off; `@repo/react` hooks handwritten
- **Drift:** PostHog **decided** ([ADR 011](../../apps/docu/content/docs/adrs/011-product-analytics.mdx), [analytics.mdx](../../apps/docu/content/docs/architecture/analytics.mdx)) but **not installed**. ADR still mentions `@vercel/analytics` — neither package is in web/mobile `package.json`. Event taxonomy **unmeasured**.
- **Unresolved:** GTM (channel, first successful use); success metrics that can fail (not `pnpm qa`); TAM/LTV (toolkit — say so); named decision owners for the product bet
- **Unresolved:** keep / iterate / kill board

`pnpm qa` going green is Quality/Pipelines, not product success.

## Minimum Useful Artifact

- problem: bootstrap a typed API + web/mobile/docs without inventing the stack
- users: adopting developers (inferred); demo end users on web auth and dashboard
- goal: portable starter with self-hosted Web2/Web3 auth and Cursor-first workflow
- non-goals: listed above as observed, not a ratified PRD
- audience/channel/first use: **unresolved** beyond “fork and run”
- metrics: **unmeasured**
- events: **unmeasured** (PostHog chosen, not shipped)
- owners: **unresolved**

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

- A new contributor can answer what we are building from README + this file: a starter/toolkit with a demo web app. Who/why/how-we-will-know beyond that is unresolved.
- Success metrics can fail. They are not CI green. Currently unmeasured.
- Named metrics have events, or are marked unmeasured (PostHog).
- GTM is named at the level the product needs, or marked unresolved.
- No silent product decisions in code without a note or open question.

## Definition of Done

Product intent is documented or explicitly deferred with named owners. Implementation aligns with stated goals and non-goals, or the docs were updated. Success that was claimed is either instrumented or marked unmeasured.

## Agent Prompt

Apply Product First to Basilic.

Read root README, `apps/docu/content/docs/index.mdx`, analytics MDX and ADR 011, and what the web, mobile, and API actually do. Do not assume documentation is complete. PostHog is not installed — do not claim events fire.

Preserve intentional existing product choices. Do not silently decide scope, priorities, pricing, TAM, LTV, event names, or GTM. This is a toolkit, not a billed product in files — say so rather than filling finance blanks.

Separate `pnpm qa` from post-launch success. If a metric is named but not instrumented, implement the event or mark it unmeasured. Do not file that as operations work. Propose the smallest useful update to README or `apps/docu`. Update this instance when paths or unresolved items change.

## Notes

**Product vs Journeys:** Product names what, why, and how we will know. Journeys name how someone finishes.

**Product vs Quality:** Product names the outcome after use. Quality names the bar that gates a release.

**Product vs Operations:** Product owns events, funnels, activation. Operations owns logs, traces, error rates, alerts, recovery.

**Product vs Data:** Product names events and outcomes to measure. Data owns canonical domain meaning, authority, lifecycle, and evolution.

**Navigation:** [Generic spec](../principles/PRODUCT.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/PRODUCT.md) · [Factory map](../ABOUT.md) · [Introduction](../../apps/docu/content/docs/index.mdx) · [ADR 011](../../apps/docu/content/docs/adrs/011-product-analytics.mdx)
