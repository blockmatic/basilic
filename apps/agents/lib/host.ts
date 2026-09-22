import { configureDb } from '@repo/db'
import { runMigrations } from '@repo/db/migrate'
import { configureMarkets } from '@repo/markets'
import { configureOnchain } from '@repo/onchain'
import { logger } from '@repo/utils/logger/server'
import { env } from './env.js'

type HostGlobal = typeof globalThis & { __basilicEveHostBoot?: Promise<void> }

export function isEveHostBuild() {
  return Boolean(env.EVE_INTERNAL_HOST_BUILD_OUTPUT_DIRECTORY)
}

export async function bootHost(): Promise<void> {
  const g = globalThis as HostGlobal
  g.__basilicEveHostBoot ??= startHost()
  return g.__basilicEveHostBoot
}

async function startHost(): Promise<void> {
  configureMarkets({
    coinGeckoDemoApiKey: env.COINGECKO_DEMO_API_KEY,
    coinsUseFixture: env.COINS_USE_FIXTURE,
    cacheMs: env.MARKETS_CACHE_MS,
  })
  configureOnchain({ alchemyApiKey: env.ALCHEMY_API_KEY })

  if (isEveHostBuild()) return

  configureDb({
    databaseUrl: env.POSTGRES_URL,
    pglite: env.PGLITE === true,
  })
  await runMigrations({
    logger: {
      info: msg => logger.info(msg),
      error: (msg, err) => logger.error({ err }, msg),
    },
    nodeEnv: env.NODE_ENV,
    vercelEnv: env.VERCEL_ENV,
  })
}

await bootHost()
