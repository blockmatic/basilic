import { configureMarkets } from '@repo/markets'
import { env } from './env.js'

export function bootMarkets(): void {
  configureMarkets({
    coinGeckoDemoApiKey: env.COINGECKO_DEMO_API_KEY,
    coinsUseFixture: env.COINS_USE_FIXTURE,
    cacheMs: env.MARKETS_CACHE_MS,
  })
}

bootMarkets()
