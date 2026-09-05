# Security First

## Principle

See /f-security.

## Artifacts

- **Fact:** [`../../apps/docu/content/docs/architecture/security.mdx`](../../apps/docu/content/docs/architecture/security.mdx) — scanners, CORS, rate limits
- **Fact:** [`../../apps/docu/content/docs/architecture/authentication.mdx`](../../apps/docu/content/docs/architecture/authentication.mdx) — JWT, methods, keys
- **Fact:** Pre-commit: block-files → gitleaks → OSV → Biome. Commands: `pnpm security:check`
- **Fact:** CI: [`.github/workflows/security.yml`](../../.github/workflows/security.yml) (every PR + main); [`.github/workflows/deepsec.yml`](../../.github/workflows/deepsec.yml) (trusted same-repo PRs)
- **Fact:** Principals: session JWT (`typ=access` / `typ=refresh`); machine API key `bask_<prefix>_<secret>` hashed at rest
- **Fact:** Web gate: [`../../apps/web/proxy.ts`](../../apps/web/proxy.ts) only. Do not duplicate in layouts. Public includes `/auth/session/revoke`.
- **Fact:** New-device mail: fingerprint on other session rows; `WEB_APP_URL` allowlisted; JWT-only session list/delete; public revoke token CAS.
- **Fact:** CORS SoT: Fastify `ALLOWED_ORIGINS` (`apps/api/src/plugins/cors.ts`). Prod fails on `*` or empty. Not `vercel.json`.
- **Fact:** Login-route rate-limit subset as shipped in security MDX. In-memory per instance (Operations names the replica gap).
- **Fact:** Cookie `api.session` is `httpOnly: false` by design so the browser client can send Bearer to Fastify for domain data. Next writes the cookie after Fastify success (`POST /api/auth/refresh`, callbacks, `update-tokens`). Fastify remains issuer and revocation. Refresh reuse-grace on previous `jti`.
- **Fact:** Secrets: `ENCRYPTION_KEY`, `JWT_SECRET`, OAuth client secrets, `RESEND_API_KEY`, AI keys, `SENTRY_DSN` (unused until Sentry is re-enabled), `DATABASE_URL`, `AI_GATEWAY_API_KEY`, `EXPO_TOKEN`
- **Unresolved:** named threat model; data classification list; in-product AI tool permission matrix
- **Unresolved:** accepted-risk register with owner and next review
- **Unresolved:** refresh ownership / concurrency protocol (Architecture names the dual-path drift)

Treat coding agents as a service account: least privilege, no secrets, human approval for destructive or trust-boundary edits.

## Minimum Useful Artifact

- protected: sessions, API keys, wallets, OAuth tokens, env secrets
- principals: public, JWT user, API key
- trust boundaries: Next proxy, Fastify auth plugins, TypeBox on untrusted input
- agent: read-only inspection default; stop for secrets, destructive ops, auth policy changes
- accepted risks: `httpOnly: false` cookie (documented); in-memory rate limit; **unresolved** as a dated register

## Notes

Security defines trust, protection, and permissions. API defines contracts. Architecture maps trust boundaries. Operations defines runtime visibility. Do not define TypeBox shapes here or journey maps here.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/SECURITY.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/SECURITY.md) · [Factory map](../ABOUT.md) · [Security](../../apps/docu/content/docs/architecture/security.mdx) · [Authentication](../../apps/docu/content/docs/architecture/authentication.mdx)
