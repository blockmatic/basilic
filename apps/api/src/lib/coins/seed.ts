import type { getDb } from '@repo/db'
import { assetMarkets, assetNetworks, assetProviders, assets } from '@repo/db/schema'
import { fixtureQuotes } from '@repo/markets'

export type CoinsDb = Awaited<ReturnType<typeof getDb>>

const binancePairs: Record<string, { symbol: string; quote: string }> = {
  bitcoin: { symbol: 'BTCUSDT', quote: 'USDT' },
  ethereum: { symbol: 'ETHUSDT', quote: 'USDT' },
  ripple: { symbol: 'XRPUSDT', quote: 'USDT' },
  binancecoin: { symbol: 'BNBUSDT', quote: 'USDT' },
  solana: { symbol: 'SOLUSDT', quote: 'USDT' },
  'usd-coin': { symbol: 'USDCUSDT', quote: 'USDT' },
  dogecoin: { symbol: 'DOGEUSDT', quote: 'USDT' },
  cardano: { symbol: 'ADAUSDT', quote: 'USDT' },
  tron: { symbol: 'TRXUSDT', quote: 'USDT' },
  'avalanche-2': { symbol: 'AVAXUSDT', quote: 'USDT' },
  chainlink: { symbol: 'LINKUSDT', quote: 'USDT' },
  'shiba-inu': { symbol: 'SHIBUSDT', quote: 'USDT' },
  polkadot: { symbol: 'DOTUSDT', quote: 'USDT' },
  'bitcoin-cash': { symbol: 'BCHUSDT', quote: 'USDT' },
  sui: { symbol: 'SUIUSDT', quote: 'USDT' },
  stellar: { symbol: 'XLMUSDT', quote: 'USDT' },
  uniswap: { symbol: 'UNIUSDT', quote: 'USDT' },
  litecoin: { symbol: 'LTCUSDT', quote: 'USDT' },
  near: { symbol: 'NEARUSDT', quote: 'USDT' },
}

export const binanceCatalogPairCount = Object.keys(binancePairs).length

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
      if (!pair) continue
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

export async function seedIdentityIfEmpty({ db }: { db: CoinsDb }): Promise<void> {
  const existing = await db.select({ id: assets.id }).from(assets)
  const have = new Set(existing.map(row => row.id))
  if (fixtureQuotes.some(row => !have.has(row.id))) await seedIdentity({ db })
}
