import { configureMarkets } from "@repo/markets";

import { env } from "./env.js";

export function bootMarkets(): void {
  configureMarkets({
    cacheMs: env.MARKETS_CACHE_MS,
    coinGeckoDemoApiKey: env.COINGECKO_DEMO_API_KEY,
    coinsUseFixture: env.COINS_USE_FIXTURE,
  });
}

bootMarkets();
