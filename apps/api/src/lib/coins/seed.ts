import type { getDb } from '../../db/index.js'
import { assetMarkets, assetNetworks, assetProviders, assets } from '../../db/schema/index.js'
import { fixtureQuotes } from './fixture.js'

export type CoinsDb = Awaited<ReturnType<typeof getDb>>

const binancePairs = {
  bitcoin: { symbol: 'BTCUSDT', quote: 'USDT' },
  ethereum: { symbol: 'ETHUSDT', quote: 'USDT' },
  ripple: { symbol: 'XRPUSDT', quote: 'USDT' },
  solana: { symbol: 'SOLUSDT', quote: 'USDT' },
  dogecoin: { symbol: 'DOGEUSDT', quote: 'USDT' },
  cardano: { symbol: 'ADAUSDT', quote: 'USDT' },
} as const

export async function seedIdentity({ db }: { db: CoinsDb }): Promise<void> {
  const now = new Date()
  await db.transaction(async tx => {
    for (const row of fixtureQuotes)
      await tx
        .insert(assets)
        .values({
          id: row.id,
          symbol: row.symbol,
          name: row.name,
          imageUrl: row.imageUrl,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: assets.id,
          set: {
            symbol: row.symbol,
            name: row.name,
            imageUrl: row.imageUrl,
            enabled: true,
            updatedAt: now,
          },
        })

    for (const row of fixtureQuotes) {
      await tx
        .insert(assetProviders)
        .values({
          id: `coingecko:${row.id}`,
          assetId: row.id,
          provider: 'coingecko',
          providerId: row.id,
        })
        .onConflictDoUpdate({
          target: assetProviders.id,
          set: { assetId: row.id, provider: 'coingecko', providerId: row.id },
        })

      const pair = binancePairs[row.id]
      await tx
        .insert(assetMarkets)
        .values({
          id: `binance:${pair.symbol}`,
          assetId: row.id,
          provider: 'binance',
          symbol: pair.symbol,
          quote: pair.quote,
        })
        .onConflictDoUpdate({
          target: assetMarkets.id,
          set: {
            assetId: row.id,
            provider: 'binance',
            symbol: pair.symbol,
            quote: pair.quote,
          },
        })
    }

    await tx
      .insert(assetNetworks)
      .values({
        id: 'eip155:1:native',
        assetId: 'ethereum',
        chainCaip2: 'eip155:1',
        contractAddress: null,
        decimals: 18,
        isNative: true,
      })
      .onConflictDoUpdate({
        target: assetNetworks.id,
        set: {
          assetId: 'ethereum',
          chainCaip2: 'eip155:1',
          contractAddress: null,
          decimals: 18,
          isNative: true,
        },
      })
  })
}
