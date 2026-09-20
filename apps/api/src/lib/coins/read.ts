import { asc, eq } from 'drizzle-orm'
import { type CoinMarket, coinMarkets, coinSync } from '../../db/schema/index.js'
import { type CoinsDb, seedMockMarkets } from './seed.js'

const globalSyncId = 'global'

function toCoinDto(row: CoinMarket) {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    imageUrl: row.imageUrl ?? null,
    priceUsd: row.priceUsd,
    change24h: row.change24h,
    volumeUsd: row.volumeUsd,
    marketCapUsd: row.marketCapUsd,
    rank: row.rank,
    fetchedAt: row.fetchedAt.toISOString(),
  }
}

function toSyncDto(
  row: { source: string; fetchedAt: Date | null; lastError: string | null } | undefined,
) {
  if (!row) return { source: 'mock', fetchedAt: null, lastError: null }
  return {
    source: row.source,
    fetchedAt: row.fetchedAt?.toISOString() ?? null,
    lastError: row.lastError,
  }
}

export async function listMarkets({ db }: { db: CoinsDb }) {
  const existing = await db.select({ id: coinMarkets.id }).from(coinMarkets).limit(1)
  if (existing.length === 0) await seedMockMarkets({ db })

  const coins = await db
    .select()
    .from(coinMarkets)
    .orderBy(asc(coinMarkets.rank), asc(coinMarkets.id))
  const [sync] = await db.select().from(coinSync).where(eq(coinSync.id, globalSyncId)).limit(1)

  return { coins: coins.map(toCoinDto), sync: toSyncDto(sync) }
}
