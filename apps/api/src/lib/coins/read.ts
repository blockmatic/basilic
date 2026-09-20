import { assets } from '@repo/db/schema'
import { eq } from 'drizzle-orm'
import { getMarkets, type MarketRow, type Provenance } from '../markets/index.js'
import { type CoinsDb, seedIdentity } from './seed.js'

const coinGeckoAttribution = 'Data by CoinGecko'

function toCoinDto({
  asset,
  quote,
}: {
  asset: { id: string; symbol: string; name: string; imageUrl: string | null }
  quote: MarketRow
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

function toSync({ source, markets }: { source: Provenance; markets: MarketRow[] }) {
  const fetchedAt =
    source === 'fixture'
      ? null
      : (markets.find(row => row.fetchedAt)?.fetchedAt ?? new Date().toISOString())
  return {
    source,
    fetchedAt,
    lastError: null,
    ...(source === 'stale' ? { stale: true } : {}),
    ...(source === 'live' ? { attribution: coinGeckoAttribution } : {}),
  }
}

export async function listMarkets({ db }: { db: CoinsDb }) {
  const existing = await db.select({ id: assets.id }).from(assets).limit(1)
  if (existing.length === 0) await seedIdentity({ db })

  const rows = await db.select().from(assets).where(eq(assets.enabled, true))
  const { markets, source } = await getMarkets({})
  const quotes = new Map(markets.map(quote => [quote.id, quote]))
  const coins = rows
    .flatMap(asset => {
      const quote = quotes.get(asset.id)
      if (!quote) return []
      return [toCoinDto({ asset, quote })]
    })
    .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id))

  return { coins, sync: toSync({ source, markets }) }
}
