# Data First

## Principle

Define canonical domain concepts, ownership, lifecycle, and change rules before stores, schemas, and events proliferate competing truths.

## Statement

I treat data as durable product state with meaning, ownership, and a lifecycle—not as columns left behind by features. Before several stores or consumers encode the same concept differently, I want to know what the concept means, which system is authoritative, how identity works, how it changes, how long it lives, and how it is removed.

## Outcome

Core domain concepts have shared names and definitions. Each important dataset has an owner and authoritative source. Identity, constraints, retention, deletion, lineage, and schema evolution are explicit at the level the product needs. Migrations preserve or deliberately transform meaning. Copies do not silently become competing sources of truth.

## Artifacts

- **Fact:** Owner is `apps/api` only. Schema: [`../../apps/api/src/db/schema/`](../../apps/api/src/db/schema/)
- **Fact:** ADRs [007](../../apps/docu/content/docs/adrs/007-backend-orm.mdx) (Drizzle) and [008](../../apps/docu/content/docs/adrs/008-database.mdx) (Postgres)
- **Fact:** Tables: `users`, `account`, `sessions`, `verification`, `auth_attempts`, `api_keys`, `wallet_identities`, `web3_nonce`, `web3_callback`, `passkey_credentials`, `passkey_challenges`, `passkey_auth_challenges`, `passkey_callback`, `totp`, `totp_setup`
- **Fact:** `oauth_state` and `oauth_link_state` are `verification.type` values, not tables ([`verification.ts`](../../apps/api/src/db/schema/tables/verification.ts))
- **Fact:** Sign-in methods: email, OAuth `account`, `wallet_identities`, `passkey_credentials`. TOTP is 2FA, not a sign-in method. Last-method guardrail on unlink.
- **Fact:** Secrets at rest: API key and refresh `jti` via `hashToken`; magic-link/change-email codes HMAC-SHA256 with `ENCRYPTION_KEY`; OAuth tokens and web3/passkey callbacks AES-GCM
- **Fact:** Migrations: [`../../apps/api/src/db/migrations/`](../../apps/api/src/db/migrations/) — generate from schema TypeScript; never hand-edit SQL
- **Unresolved:** domain glossary; retention, deletion, residency; identity/dedup beyond PK uniqueness
- **Unresolved:** PostHog as a derived copy — decided, not installed (Product)

## Minimum Useful Artifact

For `users` (and the same shape for any concept you touch):

- name: user identity for sessions and linking
- identity: text primary key; email nullable (Web3-only accounts)
- owner: Fastify API / PostgreSQL
- writers: auth and account routes; readers: JWT session load, profile, `@repo/core` clients over HTTP
- derived copies: none shipped (PostHog unmeasured)
- retention/deletion: **unresolved**
- evolution: Drizzle migrations under `apps/api/src/db/migrations/`

## Recipe

1. Inspect `apps/api/src/db/schema/`, migrations, auth/account handlers, analytics docs, and caches.
2. Understand where each concept is created, changed, copied, and deleted.
3. Identify competing definitions, unclear ownership, or extra tables invented from prose.
4. Propose the smallest useful clarification—one concept, constraint, or migration rule.
5. Define canonical meaning in Drizzle before adding a store or OpenAPI-only field.
6. Implement with `drizzle-kit generate`. Do not edit generated SQL as a parallel schema.
7. Validate read/write paths and deletion/unlink behavior (last-method guardrail).
8. Update ADRs or schema comments when meaning, ownership, or lifecycle changes; update this instance.

## Validation

- A contributor can name PostgreSQL via Drizzle as authoritative for account and session data.
- Core concepts have one meaning in tables and TypeBox representations.
- Domain invariants are enforced in DB constraints and TypeBox, not comments alone.
- Schema changes include a generated migration and rollback/recovery reasoning.
- Retention and deletion match Security and product requirements, or are marked unresolved.

## Definition of Done

The affected domain concepts, ownership, invariants, lifecycle, and evolution rules are explicit. Implementations and migrations preserve them, or deliberate transformations and unresolved risks are documented.

## Agent Prompt

Apply Data First to Basilic.

Read ADR 007/008, `apps/api/src/db/schema/`, migrations, and handlers that read and write them. Trace data from creation through copies and deletion. Do not assume the schema is the whole domain model. Do not invent tables for `oauth_state` — they are verification types.

Preserve intentional existing models. Do not introduce a warehouse, event bus, or new source of truth. Propose the smallest useful data decision. Implement with Drizzle generate. Validate real read/write paths where safe. Update durable artifacts when meaning, ownership, lifecycle, or schema changes. Update this instance when paths change.

## Notes

**Data vs Product:** Product owns event taxonomy and outcomes to measure. Data owns meaning, authority, and lifecycle of records.

**Data vs Architecture:** Architecture places stores and data flows. Data defines what the state means and which source is authoritative.

**Data vs API:** Data owns the canonical domain model. API owns the consumer-facing representation.

**Data vs Security:** Data records classification, retention, and deletion requirements. Security owns access policy.

**Data vs Quality:** Data owns domain invariants. Quality owns release gates and eval datasets.

**Data vs Operations:** Data owns product state. Operations owns telemetry about runtime health.

**Navigation:** [Generic spec](../principles/DATA.md) · [Human essay](https://github.com/blockmatic/first/blob/main/_first/articles/DATA.md) · [Factory map](../ABOUT.md) · [ADR 008](../../apps/docu/content/docs/adrs/008-database.mdx)
