# Data First

## Principle

See /f-analyst.

## Artifacts

- **Fact:** Owner is `apps/api` only. Schema: [`../../apps/api/src/db/schema/`](../../apps/api/src/db/schema/)
- **Fact:** ADRs [007](../../apps/docu/content/docs/adrs/007-backend-orm.mdx) (Drizzle) and [008](../../apps/docu/content/docs/adrs/008-database.mdx) (Postgres)
- **Fact:** Tables: `users`, `account`, `sessions` (IP, UA, `signInMethod`, `deviceLabel`, `location`, `deviceFingerprint`), `verification` (`session_revoke` among types), `auth_attempts`, `api_keys`, `wallet_identities`, `web3_nonce`, `web3_callback`, `passkey_credentials`, `passkey_challenges`, `passkey_auth_challenges`, `passkey_callback`, `totp`, `totp_setup`
- **Fact:** `oauth_state` and `oauth_link_state` are `verification.type` values, not tables ([`verification.ts`](../../apps/api/src/db/schema/tables/verification.ts))
- **Fact:** Sign-in methods: email, OAuth `account`, `wallet_identities`, `passkey_credentials`. TOTP is 2FA, not a sign-in method. Last-method guardrail on unlink.
- **Fact:** Secrets at rest: API key and refresh `jti` via `hashToken`; magic-link/change-email codes HMAC-SHA256 with `ENCRYPTION_KEY`; OAuth tokens and web3/passkey callbacks AES-GCM
- **Fact:** Migrations: [`../../apps/api/src/db/migrations/`](../../apps/api/src/db/migrations/) — generate from schema TypeScript; never hand-edit SQL
- **Fact:** Product analytics events are not a store. `capture()` does not persist. No derived analytics copy is shipped (PostHog chosen, not installed).
- **Unresolved:** domain glossary; retention, deletion, residency; identity/dedup beyond PK uniqueness
- **Unresolved:** PostHog as a derived copy — decided, not installed (Product)

## Minimum Useful Artifact

For `users` (and the same shape for any concept you touch):

- name: user identity for sessions and linking
- identity: text primary key; email nullable (Web3-only accounts)
- owner: Fastify API / PostgreSQL
- writers: auth and account routes; readers: JWT session load, profile, `@repo/core` clients over HTTP
- derived copies: none shipped (product `capture()` is a no-op)
- retention/deletion: **unresolved**
- evolution: Drizzle migrations under `apps/api/src/db/migrations/`

## Notes

Product owns event taxonomy. Architecture places stores. Data owns meaning and authority. API owns the consumer-facing representation. Do not invent tables for `oauth_state` — they are verification types. Do not introduce a warehouse or event bus.

**Navigation:** [Generic spec](https://github.com/blockmatic/first/blob/main/_first/principles/DATA.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/DATA.md) · [Factory map](../ABOUT.md) · [ADR 007](../../apps/docu/content/docs/adrs/007-backend-orm.mdx) · [ADR 008](../../apps/docu/content/docs/adrs/008-database.mdx)
