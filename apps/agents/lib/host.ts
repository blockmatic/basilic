import { configureDb } from '@repo/db'
import { runMigrations } from '@repo/db/migrate'
import { configureMarkets } from '@repo/markets'
import { configureOnchain } from '@repo/onchain'
import { logger } from '@repo/utils/logger/server'
import { env } from './env.js'

export async function bootHost(): Promise<void> {
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
  await runMigrations({
    logger: {
      info: msg => logger.info(msg),
      error: (msg, err) => logger.error({ err }, msg),
    },
    nodeEnv: env.NODE_ENV,
  })
}

await bootHost()
