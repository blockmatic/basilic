import { configureDb } from '@repo/db'
import { configureMarkets } from '@repo/markets'
import { configureOnchain } from '@repo/onchain'
import { env } from './env.js'

export function bootHost(): void {
  configureDb({
    databaseUrl: env.DATABASE_URL,
    pglite: env.PGLITE,
  })
  configureMarkets({
    coinGeckoDemoApiKey: env.COINGECKO_DEMO_API_KEY,
    coinsUseFixture: env.COINS_USE_FIXTURE,
    cacheMs: env.MARKETS_CACHE_MS,
  })
  configureOnchain({ alchemyApiKey: env.ALCHEMY_API_KEY })
}

bootHost()
