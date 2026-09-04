import { tool } from 'ai'
import { z } from 'zod'

export const coingeckoMarketsUrl =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'

export type MarketRow = {
  id: string
  symbol: string
  name: string
  currentPrice: number
  change24h: number
  marketCapRank: number
}

export const marketSnapshotMock: MarketRow[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    currentPrice: 67_420.12,
    change24h: 2.14,
    marketCapRank: 1,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    currentPrice: 3_412.5,
    change24h: -1.08,
    marketCapRank: 2,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    currentPrice: 178.4,
    change24h: 4.62,
    marketCapRank: 5,
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    currentPrice: 0.62,
    change24h: 0.41,
    marketCapRank: 4,
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    currentPrice: 0.45,
    change24h: -2.3,
    marketCapRank: 9,
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    currentPrice: 0.12,
    change24h: 6.11,
    marketCapRank: 8,
  },
]

const marketCardRoot = 'market-card-1'

export function toMarketRows(raw: unknown): MarketRow[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const id = typeof row.id === 'string' ? row.id : ''
    const symbol = typeof row.symbol === 'string' ? row.symbol : ''
    const name = typeof row.name === 'string' ? row.name : ''
    const currentPrice = typeof row.current_price === 'number' ? row.current_price : Number.NaN
    const change24h =
      typeof row.price_change_percentage_24h === 'number' ? row.price_change_percentage_24h : 0
    const marketCapRank = typeof row.market_cap_rank === 'number' ? row.market_cap_rank : 0
    if (!id || !symbol || !name || Number.isNaN(currentPrice)) return []
    return [{ id, symbol, name, currentPrice, change24h, marketCapRank }]
  })
}

export function pickMovers(rows: MarketRow[], query?: string) {
  const q = query?.trim().toLowerCase()
  const filtered = q
    ? rows.filter(
        r =>
          r.symbol.toLowerCase() === q ||
          r.id.toLowerCase() === q ||
          r.name.toLowerCase().includes(q),
      )
    : rows
  const source = filtered.length > 0 ? filtered : rows
  const sorted = [...source].toSorted((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
  return sorted.slice(0, 5)
}

export function buildMarketCardSpec({
  movers,
  source,
}: {
  movers: MarketRow[]
  source: 'live' | 'mock'
}) {
  const top = movers[0]
  const headline = top
    ? `${top.name} ${top.change24h >= 0 ? 'led' : 'lagged'} the board`
    : 'Market snapshot'
  return {
    root: marketCardRoot,
    elements: {
      [marketCardRoot]: {
        type: 'MarketCard',
        props: {
          headline,
          source,
          movers: movers.map(m => ({
            symbol: m.symbol.toUpperCase(),
            name: m.name,
            price: m.currentPrice,
            change24h: m.change24h,
          })),
        },
        children: [],
      },
    },
  } as const
}

export async function loadMarketRows(): Promise<{ rows: MarketRow[]; source: 'live' | 'mock' }> {
  try {
    const res = await fetch(coingeckoMarketsUrl, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) return { rows: marketSnapshotMock, source: 'mock' }
    const rows = toMarketRows(await res.json())
    if (rows.length === 0) return { rows: marketSnapshotMock, source: 'mock' }
    return { rows, source: 'live' }
  } catch {
    return { rows: marketSnapshotMock, source: 'mock' }
  }
}

export function createMarketSnapshotTool() {
  return tool({
    description:
      'Returns a crypto market snapshot (prices and 24h change). Use when the user asks what moved, BTC, ETH, top coins, or a market overview. Optional query filters by symbol or name.',
    inputSchema: z.object({
      query: z.string().max(64).optional(),
    }),
    execute: async ({ query }: { query?: string }) => {
      const { rows, source } = await loadMarketRows()
      const movers = pickMovers(rows, query)
      const spec = buildMarketCardSpec({ movers, source })
      const summary = movers
        .map(m => `${m.symbol.toUpperCase()} ${m.change24h.toFixed(2)}%`)
        .join('; ')
      return {
        __render: 'market-card',
        spec,
        summary: summary.length > 0 ? summary : 'No market rows.',
      }
    },
  })
}
