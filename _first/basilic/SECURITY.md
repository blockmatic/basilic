# Security First

## Principle

Identify what you are trusting, protecting, exposing, and allowing — proportionally to actual risk — before architecture makes security assumptions expensive to change.

## Statement

Security is not a phase at the end. It is a set of decisions about boundaries: who can access what, what data is sensitive, what inputs are untrusted, what an agent is allowed to touch. I scale rigor to risk — an internal tool and a regulated financial product do not get the same bar. I also do not pretend risk is zero.

## Outcome

Trust boundaries are documented. Auth rules are consistent and enforced at boundaries. Secrets are not committed and not logged. External inputs are validated. Agent permissions are scoped: read-only where possible, destructive actions gated, secrets minimized, human approval for high-risk operations.

## Artifacts

- **Fact:** [`../../apps/docu/content/docs/architecture/security.mdx`](../../apps/docu/content/docs/architecture/security.mdx) — scanners, CORS, rate limits
- **Fact:** [`../../apps/docu/content/docs/architecture/authentication.mdx`](../../apps/docu/content/docs/architecture/authentication.mdx) — JWT, methods, keys
- **Fact:** Pre-commit: block-files → gitleaks → OSV → Biome. Commands: `pnpm security:check`
- **Fact:** CI: [`.github/workflows/security.yml`](../../.github/workflows/security.yml) (every PR + main); [`.github/workflows/deepsec.yml`](../../.github/workflows/deepsec.yml) (trusted same-repo PRs)
- **Fact:** Principals: session JWT (`typ=access` / `typ=refresh`); machine API key `bask_<prefix>_<secret>` hashed at rest
- **Fact:** Web gate: [`../../apps/web/proxy.ts`](../../apps/web/proxy.ts) only. Do not duplicate in layouts.
- **Fact:** CORS SoT: Fastify `ALLOWED_ORIGINS` (`apps/api/src/plugins/cors.ts`). Prod fails on `*` or empty. Not `vercel.json`.
- **Fact:** Login-route rate-limit subset as shipped in security MDX. In-memory per instance (Operations names the replica gap).
- **Fact:** Cookie `api.session` is `httpOnly: false` by design so the browser client can read tokens. Same-origin `update-tokens` + Fastify `validate-tokens` before write.
- **Fact:** Secrets: `ENCRYPTION_KEY`, `JWT_SECRET`, OAuth client secrets, `RESEND_API_KEY`, AI keys, `SENTRY_DSN`, `DATABASE_URL`, `AI_GATEWAY_API_KEY`, `EXPO_TOKEN`
- **Unresolved:** named threat model; data classification list; in-product AI tool permission matrix
- **Unresolved:** accepted-risk register with owner and next review

Treat coding agents as a service account: least privilege, no secrets, human approval for destructive or trust-boundary edits.

## Minimum Useful Artifact

- protected: sessions, API keys, wallets, OAuth tokens, env secrets
- principals: public, JWT user, API key
- trust boundaries: Next proxy, Fastify auth plugins, TypeBox on untrusted input
- agent: read-only inspection default; stop for secrets, destructive ops, auth policy changes
- accepted risks: `httpOnly: false` cookie (documented); in-memory rate limit; **unresolved** as a dated register

## Recipe

1. Inspect security MDX, auth MDX, `apps/web/proxy.ts`, Fastify auth/CORS/security plugins, scanners.
2. Understand what is stored, transmitted, logged, and exposed to agents (coding and `/ai/*`).
3. Identify auth drift across web/API/CLI, secrets in logs, untrusted input without TypeBox.
4. Propose the smallest security fix or documentation update.
5. Scope agent permissions like a role. Gate destructive work.
6. Implement with existing scanners and auth patterns. Do not invent a parallel auth system.
7. Validate with `pnpm security:check` and existing auth tests. Failures fixed or explicitly accepted.
8. Update security MDX when the trust model changes; update this instance.

## Validation

- Auth enforced at proxy and Fastify, not ad hoc per handler.
- No secrets in code, logs, or agent-accessible files without justification.
- Destructive and high-risk operations require human approval.
- Security scans pass, or failures are accepted with rationale.

## Definition of Done

Trust boundaries and permissions are documented and implemented consistently. Agent access is scoped. Identified risks are addressed or explicitly accepted at the appropriate level.

## Agent Prompt

Apply Security First to Basilic.

Read security and authentication MDX, `apps/web/proxy.ts`, Fastify auth, CORS, and scanners before changing trust boundaries. Inspect implementation; do not assume docs match.

Prefer read-only inspection. Avoid secrets. Require a human for destructive or security-consequential changes. Treat yourself as a service account. Do not define TypeBox shapes here (API) or journey maps (Journeys).

Propose the smallest useful security fix or documentation update. Use existing scanners. Update durable security artifacts when the trust model changes. Update this instance when paths change.

## Notes

**Security vs Operations:** Security defines trust, protection, and permissions. Operations defines runtime visibility and recovery.

**Security vs API:** API defines contracts at boundaries. Security defines who may invoke them and what they may access.

**Security vs Architecture:** Architecture maps trust boundaries. Security defines protection and authorization policy across them.

**Security vs Data:** Data maps classification, copies, retention, and deletion. Security owns access and protection policy.

**Navigation:** [Generic spec](../principles/SECURITY.md) · [Human essay](../articles/SECURITY.md) · [Factory map](../ABOUT.md) · [Security](../../apps/docu/content/docs/architecture/security.mdx) · [Authentication](../../apps/docu/content/docs/architecture/authentication.mdx)
