import type { getDb } from '../../db/index.js'
import { coinMarkets, coinSync } from '../../db/schema/index.js'

export type CoinsDb = Awaited<ReturnType<typeof getDb>>

export const mockMarketRows = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    priceUsd: 67_420.12,
    change24h: 2.14,
    volumeUsd: 28_000_000_000,
    marketCapUsd: 1_320_000_000_000,
    rank: 1,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    priceUsd: 3_412.5,
    change24h: -1.08,
    volumeUsd: 14_000_000_000,
    marketCapUsd: 410_000_000_000,
    rank: 2,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    imageUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    priceUsd: 0.62,
    change24h: 0.41,
    volumeUsd: 1_100_000_000,
    marketCapUsd: 35_000_000_000,
    rank: 4,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    priceUsd: 178.4,
    change24h: 4.62,
    volumeUsd: 3_200_000_000,
    marketCapUsd: 82_000_000_000,
    rank: 5,
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    priceUsd: 0.12,
    change24h: 6.11,
    volumeUsd: 1_500_000_000,
    marketCapUsd: 17_000_000_000,
    rank: 8,
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    priceUsd: 0.45,
    change24h: -2.3,
    volumeUsd: 800_000_000,
    marketCapUsd: 16_000_000_000,
    rank: 9,
  },
] as const

const globalSyncId = 'global'

export async function seedMockMarkets({ db }: { db: CoinsDb }): Promise<void> {
  const now = new Date()
  for (const row of mockMarketRows)
    await db
      .insert(coinMarkets)
      .values({ ...row, fetchedAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: coinMarkets.id,
        set: {
          symbol: row.symbol,
          name: row.name,
          imageUrl: row.imageUrl,
          priceUsd: row.priceUsd,
          change24h: row.change24h,
          volumeUsd: row.volumeUsd,
          marketCapUsd: row.marketCapUsd,
          rank: row.rank,
          fetchedAt: now,
          updatedAt: now,
        },
      })

  await db
    .insert(coinSync)
    .values({
      id: globalSyncId,
      source: 'mock',
      fetchedAt: null,
      lastError: null,
      lastStatus: null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: coinSync.id,
      set: {
        source: 'mock',
        fetchedAt: null,
        lastError: null,
        lastStatus: null,
        updatedAt: now,
      },
    })
}
