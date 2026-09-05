# Operations First

## Principle

See /f-operations.

## Artifacts

- **Fact:** [logging.mdx](../../apps/docu/content/docs/architecture/logging.mdx) — Pino `@repo/utils/logger/server` and `/client`. HTTP: Fastify `request.log` with join key **`reqId`**. Secrets redacted. Never `console.*` in app code.
- **Fact:** [error-handling.mdx](../../apps/docu/content/docs/architecture/error-handling.mdx) — `@repo/error` `captureError` is log-only; Sentry packages installed but **inactive**; HTTP catalog `{ code, message }`
- **Fact:** `GET /health` is readiness: **200** `{ ok: true, dbReady: true }` when `SELECT 1` succeeds; **503** `{ ok: false, dbReady: false }` when the store is down. No Resend/AI/IdP probes.
- **Fact:** Deploy: [vercel.mdx](../../apps/docu/content/docs/deployment/vercel.mdx), [self-hosted-llm.mdx](../../apps/docu/content/docs/deployment/self-hosted-llm.mdx)
- **Fact:** Rate limits are in-memory per API instance (Security names the policy; this station names the multi-replica blind spot)
- **Fact:** `session_issued` is ops (Pino). Product `auth_succeeded` / `auth_failed` are no-op `capture()` calls, not log lines.
- **Unresolved:** dashboards and alert rules; runbooks; verify-in-the-running-system after deploy
- **Unresolved:** production identity/retries for in-product AI agents

PostHog is Product, not operations. Pino `session_issued` is ops. Do not file a missing collected product event as an ops ticket.

## Minimum Useful Artifact

- critical path: auth and API 500s that strand a user
- signal: Pino `request.log` / `reqId`; `/health`; Sentry **inactive**
- join key: **`reqId`** (`x-request-id`, Fastify LogController; Next BFF forwards the header)
- alert/owner/escalation: **unresolved**
- recovery: **unresolved** as runbooks
- verify: **unresolved** (CI green is not this)

## Notes

Workflow moves changes into production. Operations understands and runs the system after deployment. Security defines trust. Product owns whether the bet is working. Do not invent `console` logging. Do not file PostHog gaps as ops.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/OPERATIONS.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/OPERATIONS.md) · [Factory map](../ABOUT.md) · [Logging](../../apps/docu/content/docs/architecture/logging.mdx) · [Error handling](../../apps/docu/content/docs/architecture/error-handling.mdx)
