# Coin Tracker

Reference app for Basilic's agentic UI. Public market data, commands that call tools, chat on the board, and wallet sign-in. It is a Basilic app that diverged. Docs: https://basilic-docs.vercel.app

## Setup

```bash
pnpm setup
pnpm dev
```

## Hosts

- https://tracker.localhost
- https://api.tracker.localhost
- https://agents.tracker.localhost
- https://email.tracker.localhost

There is no Doku app and no mobile app in this workspace. Local Postgres stays on `127.0.0.1:54322`.

Update local OAuth and passkey consoles from `basilic.localhost` to `tracker.localhost`. Production Vercel hostnames are unchanged.

## Env

CoinGecko, Binance fixtures (`COINS_USE_FIXTURE`), Alchemy, and WalletConnect are Coin Tracker settings. See `apps/api/.env.defaults.example`.

## Checks

```bash
pnpm qa
```
