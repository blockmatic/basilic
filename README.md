# Basilic

Domain-agnostic starter. API, web, command agent, and Expo mobile. Doku and `create-basilic` live here and are not copied into generated apps. Coin Tracker is [blockmatic/basilic-tracker](https://github.com/blockmatic/basilic-tracker).

## Purpose

To be defined.

## Setup

```bash
pnpm setup
pnpm dev
```

`pnpm dev` does not start Expo.

```bash
pnpm --filter @repo/mobile start
```

## Hosts

- https://basilic.localhost
- https://api.basilic.localhost
- https://agents.basilic.localhost
- https://email.basilic.localhost
- https://docu.basilic.localhost

Local Postgres is `127.0.0.1:54422`. Tests use PGlite.

## Auth

Browser sessions use cookies. API keys are hashed, shown once, and sent as `Bearer bask_…` or `X-API-Key`. A `bask_` key is not an eve access JWT. Mobile stores magic-link JWTs in `expo-secure-store` and refreshes with `POST /auth/session/refresh`.

| Client | API URL |
| --- | --- |
| iOS simulator | `https://api.basilic.localhost` |
| Generated app | `https://api.{label}.localhost` |
| Android emulator or a physical device | tunnel or LAN URL, never `.localhost` |

## Checks

```bash
pnpm qa
```

Docs: https://basilic-docs.vercel.app
