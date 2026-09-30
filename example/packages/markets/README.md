# @repo/markets

CoinGecko Demo and Binance public REST for quotes, discovery, and candles. Fastify and the eve host call this package. Next.js must not import it.

## Usage

Call `configureMarkets({ coinGeckoDemoApiKey, coinsUseFixture, cacheMs })` from the host env. The package does not import app `env`. Named exports: `searchAssets`, `getMarkets`, `getQuote`, `getCandles`, `getTrending`, `getAsset`, `getGlobal`. Fastify `GET /coins/:assetId/candles` and eve `get_candles` pass `mapping.binanceSymbol` from `@repo/db`. Fastify `GET /coins/global` and `GET /coins/trending` wrap `getGlobal` / `getTrending`. There is no wallet or NFT helper.

Architecture: [Package conventions](https://basilic-docs.vercel.app/docs/development/package-conventions).

## Scripts

- `pnpm --filter @repo/markets build` — Compile to `dist/`
- `pnpm --filter @repo/markets checktypes` — Type-check
- `pnpm --filter @repo/markets test` — Vitest
