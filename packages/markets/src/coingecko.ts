import { Coingecko } from '@coingecko/coingecko-typescript'
import { getMarketsConfig } from './config.js'
import { fetchAllowed, fetchTimeoutMs } from './policy.js'
import type {
  AssetDetail,
  GetMarketsArgs,
  GlobalStats,
  MarketRow,
  MarketsResult,
  Quote,
  SearchResult,
  TrendingResult,
} from './types.js'

let client: Coingecko | undefined

function getClient(): Coingecko {
  client ??= new Coingecko({
    environment: 'demo',
    baseURL: null,
    proAPIKey: null,
    demoAPIKey: getMarketsConfig().coinGeckoDemoApiKey ?? null,
    defaultHeaders: { 'x-cg-pro-api-key': null },
    fetch: fetchAllowed,
    maxRetries: 0,
    timeout: fetchTimeoutMs,
    logLevel: 'off',
  })
  return client
}

export function resetCoinGeckoClient(): void {
  client = undefined
}

export function geckoId({
  assetId,
  coingeckoId,
}: {
  assetId: string
  coingeckoId?: string
}): string {
  return coingeckoId ?? assetId
}

export async function fetchCoinGeckoMarkets({
  vs,
  topN,
  category,
  ids,
  sparkline,
}: GetMarketsArgs): Promise<MarketsResult> {
  const vsCurrency = vs ?? 'usd'
  const query: {
    vs_currency: string
    category?: string
    ids?: string
    per_page?: number
    sparkline?: boolean
  } = { vs_currency: vsCurrency }
  if (category) query.category = category
  if (ids?.length) query.ids = ids.join(',')
  if (topN !== undefined) query.per_page = topN
  if (sparkline !== undefined) query.sparkline = sparkline
  const rows = await getClient().coins.markets.get(query)
  return { markets: rows.flatMap(row => toMarketRow({ row, vs: vsCurrency })), source: 'live' }
}

function toMarketRow({
  row,
  vs,
}: {
  row: {
    id: string
    symbol: string
    name: string
    image?: string
    current_price?: number | null
    price_change_percentage_24h?: number | null
    total_volume?: number | null
    market_cap?: number | null
    market_cap_rank?: number | null
    last_updated?: string
  }
  vs: string
}): MarketRow[] {
  if (vs.toLowerCase() !== 'usd') return []
  const priceUsd = row.current_price
  if (typeof priceUsd !== 'number' || !Number.isFinite(priceUsd)) return []
  return [
    {
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      imageUrl: row.image ?? null,
      priceUsd,
      change24h: row.price_change_percentage_24h ?? 0,
      volumeUsd: row.total_volume ?? 0,
      marketCapUsd: row.market_cap ?? 0,
      rank: row.market_cap_rank ?? 0,
      fetchedAt: row.last_updated ?? new Date().toISOString(),
      source: 'live',
      provider: 'coingecko',
    },
  ]
}

export async function fetchCoinGeckoQuote({
  assetId,
  vs = 'usd',
  coingeckoId,
}: {
  assetId: string
  vs?: string
  coingeckoId?: string
}): Promise<Quote> {
  const id = geckoId({ assetId, coingeckoId })
  const payload = await getClient().simple.price.get({
    ids: id,
    vs_currencies: vs,
    include_24hr_change: true,
    include_last_updated_at: true,
  })
  const row = payload[id] as Record<string, number | undefined> | undefined
  const price = row?.[vs]
  if (typeof price !== 'number' || !Number.isFinite(price))
    throw new Error('coingecko quote missing')
  const change = row?.[`${vs}_24h_change`]
  const updated = row?.last_updated_at
  return {
    assetId,
    vs,
    price,
    change24h: typeof change === 'number' ? change : 0,
    fetchedAt:
      typeof updated === 'number'
        ? new Date(updated * 1000).toISOString()
        : new Date().toISOString(),
    source: 'live',
    provider: 'coingecko',
  }
}

export async function fetchCoinGeckoSearch({ text }: { text: string }): Promise<SearchResult> {
  const payload = await getClient().search.get({ query: text })
  return {
    hits: payload.coins.map(coin => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      rank: coin.market_cap_rank,
    })),
    source: 'live',
  }
}

export async function fetchCoinGeckoTrending(): Promise<TrendingResult> {
  const payload = await getClient().search.trending.get()
  return {
    coins: payload.coins.map(entry => ({
      id: entry.item.id,
      symbol: entry.item.symbol,
      name: entry.item.name,
      rank: entry.item.market_cap_rank,
      source: 'live' as const,
    })),
    source: 'live',
  }
}

export async function fetchCoinGeckoAsset({
  assetId,
  coingeckoId,
}: {
  assetId: string
  coingeckoId?: string
}): Promise<AssetDetail> {
  const id = geckoId({ assetId, coingeckoId })
  const payload = await getClient().coins.getID(id, {
    localization: false,
    tickers: false,
    sparkline: false,
  })
  return {
    id: payload.id,
    symbol: payload.symbol,
    name: payload.name,
    description: stripHtml(payload.description?.en ?? ''),
    source: 'live',
    provider: 'coingecko',
  }
}

export async function fetchCoinGeckoGlobal(): Promise<GlobalStats> {
  const payload = await getClient().global.get()
  return {
    marketCapUsd: payload.data.total_market_cap.usd ?? 0,
    volumeUsd: payload.data.total_volume.usd ?? 0,
    btcDominance: payload.data.market_cap_percentage.btc ?? 0,
    source: 'live',
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
