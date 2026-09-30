# Architecture

Basilic is the starter. Generated projects keep this file and replace the purpose. Coin Tracker lives in [basilic-tracker](https://github.com/blockmatic/basilic-tracker) and is not imported from here.

## Apps

- `apps/api` — Fastify auth, account, health, OpenAPI, and agent discovery.
- `apps/web` — Next.js welcome screen, login, settings, and the status/account command surface.
- `apps/agents` — eve `command` agent. Tools read application status and the current user. A `bask_` API key is not an eve access JWT.
- `apps/mobile` — Expo magic-link session stored in `expo-secure-store`. Start with `pnpm --filter @repo/mobile start`. `pnpm dev` does not launch it.

`apps/docu` and `tools/create-basilic` stay in this repository and are not part of a generated project.

## Auth

Browser sessions use cookies and access JWTs. API keys are hashed once, shown once, and sent as `Authorization: Bearer bask_…` or `X-API-Key`. Mobile stores the access and refresh JWTs from `POST /auth/magiclink/verify` and refreshes with `POST /auth/session/refresh`. Wallet sign-in is not part of the starter.

## Data

One migration, `0000_initial`, creates the auth tables only. Local Postgres is `127.0.0.1:54422`.

## Hosts

- https://basilic.localhost
- https://api.basilic.localhost
- https://agents.basilic.localhost
- https://email.basilic.localhost
- https://docu.basilic.localhost
