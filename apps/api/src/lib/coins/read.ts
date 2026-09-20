import { eq } from 'drizzle-orm'
import { assets } from '../../db/schema/index.js'
import { fixtureQuotes, fixtureSync } from './fixture.js'
import { type CoinsDb, seedIdentity } from './seed.js'

function toCoinDto({
  asset,
  quote,
}: {
  asset: { id: string; symbol: string; name: string; imageUrl: string | null }
  quote: (typeof fixtureQuotes)[number]
}) {
  return {
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    imageUrl: asset.imageUrl ?? quote.imageUrl,
    priceUsd: quote.priceUsd,
    change24h: quote.change24h,
    volumeUsd: quote.volumeUsd,
    marketCapUsd: quote.marketCapUsd,
    rank: quote.rank,
    fetchedAt: quote.fetchedAt,
  }
}

export async function listMarkets({ db }: { db: CoinsDb }) {
  const existing = await db.select({ id: assets.id }).from(assets).limit(1)
  if (existing.length === 0) await seedIdentity({ db })

  const rows = await db.select().from(assets).where(eq(assets.enabled, true))
  const quotes = new Map<string, (typeof fixtureQuotes)[number]>(
    fixtureQuotes.map(quote => [quote.id, quote]),
  )
  const coins = rows
    .flatMap(asset => {
      const quote = quotes.get(asset.id)
      if (!quote) return []
      return [toCoinDto({ asset, quote })]
    })
    .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id))

  return { coins, sync: { ...fixtureSync } }
}
