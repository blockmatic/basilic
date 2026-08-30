# basilic

TypeScript monorepo starter: Fastify API, Next.js dashboard, Expo client. JWT and API-key auth, OpenAPI-generated SDKs, EVM/Solana wallet linking. Users are developers running the stack, not end customers of a hosted product.

## Auth shape

- `auth` plugin `onRequest` populates `request.session` from JWT Bearer (`typ=access`) or `X-API-Key` / `Bearer bask_…` via `authenticateWithApiKey`. It never rejects; handlers must check `request.session`.
- `createSessionAndIssueTokens` issues access + refresh JWTs. `hashToken` hashes API-key secrets; compare with `timingSafeEqual`.
- `verifyMagicLinkAndIssueToken` is the email login/verify path. `verifyWalletSignature` / `verifyWeb3Auth` cover SIWE/SIWS wallet login.
- `hasRemainingLoginMethod` blocks unlinking the last auth factor.
- CORS is `*`. Auth is JWT/API key, not origin or cookies.

## Threat model

Account takeover via magic-link, OAuth, or wallet-link/verify is the highest impact. Stolen `bask_` API keys are full session equivalents. Missing `request.session.user.id` filters on Drizzle queries enable cross-user reads/writes. Wallet signature replay or address-validation skips can bind the wrong chain account.

## Project-specific patterns to flag

- Any Fastify route under `apps/api/src/routes/` that reads or writes user data without `if (!request.session)`.
- Wallet link/verify (`account/link/wallet/*`) that skips `validateAddress` or reuses a nonce.
- Magic-link verify that issues tokens without consuming the one-time token.
- API-key create/list/revoke that hashes poorly or returns the secret after create more than once.
- Next.js Server Actions or route handlers that trust the API without forwarding the session cookie/header the web app actually uses (`Authorization` Bearer).

## Known false-positives

- CORS `*` and open preflight — intentional; security is JWT/API key.
- `apps/api/src/routes/test/*` — authenticated test helpers.
- `.env.*.example`, `.env.schema`, and `.gitleaks.toml` allowlist entries — templates and fixtures, not live secrets.
- Generated OpenAPI clients (`packages/core`) and Playwright auth state — do not treat as app ingress.
