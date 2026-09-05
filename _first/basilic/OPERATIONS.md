# Operations First

## Principle

Decide how you will see, support, and recover the running system before production becomes a black box.

## Statement

Shipping is not the end of engineering work. It is when the system meets reality. I want to know what it is doing, what failed, for whom, and how to fix it — without archaeology. A product nobody can operate is a product that will fail quietly.

## Outcome

Production behavior is observable at the level the project needs. Logs are structured and useful. Metrics and alerts cover critical failure modes. Runbooks exist for known recovery paths. Product analytics are not the same dashboard as engineering health. A green pipeline after a fix is not verified recovery.

## Artifacts

- **Fact:** [logging.mdx](../../apps/docu/content/docs/architecture/logging.mdx) — Pino `@repo/utils/logger/server` and `/client`. HTTP: Fastify `request.log` with join key **`reqId`**. Secrets redacted. Never `console.*` in app code.
- **Fact:** [error-handling.mdx](../../apps/docu/content/docs/architecture/error-handling.mdx) — `@repo/error` `captureError` is log-only; Sentry packages installed but **inactive**; HTTP catalog `{ code, message }`
- **Fact:** `GET /health` → `{ ok: true, dbReady }` — no auth, no deep probes (Resend/AI/IdP)
- **Fact:** Deploy: [vercel.mdx](../../apps/docu/content/docs/deployment/vercel.mdx), [self-hosted-llm.mdx](../../apps/docu/content/docs/deployment/self-hosted-llm.mdx)
- **Fact:** Rate limits are in-memory per API instance (Security names the policy; this station names the multi-replica blind spot)
- **Fact:** `session_issued` is ops (Pino). Product `auth_succeeded` / `auth_failed` are no-op `capture()` calls, not log lines.
- **Unresolved:** dashboards and alert rules; runbooks; verify-in-the-running-system after deploy
- **Unresolved:** production identity/retries for in-product AI agents

PostHog is Product, not operations. Pino `session_issued` is ops. Product `auth_succeeded` / `auth_failed` are `capture()` calls, not log lines. Do not file a missing collected product event as an ops ticket.

## Minimum Useful Artifact

- critical path: auth and API 500s that strand a user
- signal: Pino `request.log` / `reqId`; `/health`; Sentry **inactive**
- join key: **`reqId`** (`x-request-id`, Fastify LogController; Next BFF forwards the header)
- alert/owner/escalation: **unresolved**
- recovery: **unresolved** as runbooks
- verify: **unresolved** (CI green is not this)

## Recipe

1. Inspect logging MDX, error-handling MDX, `/health`, captureError (log-only), deploy docs.
2. Understand critical failure modes and who notices first.
3. Identify a 500 with no useful log, a deploy that cannot be verified.
4. Propose the smallest useful signal — one log field, one metric, one alert.
5. Write a runbook only for paths that have burned time.
6. Implement. Do not invent product events (Product).
7. Route production bugs through workflow: issue → fix → pipeline → verify in the running system.
8. Update operational MDX when behavior or failure modes change; update this instance.

## Validation

- A developer can diagnose a common failure from Pino without guessing. Sentry is not an active sink.
- Alerts fire on real problems, or alerts are marked unresolved.
- Recovery steps are documented and exercised, or marked unresolved.
- Post-fix deploy was verified in production or staging. CI green is not that verification.

## Definition of Done

Runtime behavior is observable enough to support and debug. Recovery paths are known. Production feedback can enter the development workflow and close the loop.

## Agent Prompt

Apply Operations First to Basilic.

Read logging and error-handling MDX, `/health`, `@repo/error` / Sentry usage, and deployment docs before changing runtime behavior. Identify observability blind spots.

Propose the smallest useful logging, metric, or alert improvement. Use structured signals — not `console`. Route fixes through workflow and pipelines. Verify recovery after deploy in the running system. Do not file PostHog gaps as ops. Update this instance when paths change.

## Notes

**Operations vs Pipelines:** Pipelines move changes into production. Operations understands and runs the system after deployment.

**Operations vs Security:** Security defines trust and protection. Operations defines visibility and recovery.

**Operations vs Product:** Product owns whether the bet is working. Operations owns whether the system is healthy.

**Operations vs Architecture:** Architecture names deployment units. Operations observes and recovers them.

**Operations vs Data:** Data owns product-state meaning. Operations owns telemetry about runtime health.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/OPERATIONS.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/OPERATIONS.md) · [Factory map](../ABOUT.md) · [Logging](../../apps/docu/content/docs/architecture/logging.mdx) · [Error handling](../../apps/docu/content/docs/architecture/error-handling.mdx)
