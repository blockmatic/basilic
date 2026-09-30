# @repo/onchain

Alchemy Free Portfolio HTTP for one linked `eip155` wallet. Fastify and the eve host call this package. Next.js must not import it.

## Usage

Call `configureOnchain({ alchemyApiKey })` from the host env. The package does not import app `env`. Named exports: `getWallet`, `getNfts`. Allowlist is `api.g.alchemy.com` only. Unset key: hosts skip Portfolio calls.

Do not call CoinGecko from this package. Holding quotes stay on the Fastify composer via `@repo/markets` `getQuote`.

Architecture: [Package conventions](https://basilic-docs.vercel.app/docs/development/package-conventions).

## Scripts

- `pnpm --filter @repo/onchain build` — Compile to `dist/`
- `pnpm --filter @repo/onchain checktypes` — Type-check
- `pnpm --filter @repo/onchain test` — Vitest
