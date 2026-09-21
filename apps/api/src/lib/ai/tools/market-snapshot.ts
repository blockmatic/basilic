import { fixtureMarkets, getMarkets, type MarketRow as QuoteRow } from '@repo/markets'
import { tool } from 'ai'
import { z } from 'zod'

export type MarketRow = {
  id: string
  symbol: string
  name: string
  currentPrice: number
  change24h: number
  marketCapRank: number
}

const marketCardRoot = 'market-card-1'

function toSnapshotRows(quotes: QuoteRow[]): MarketRow[] {
  return quotes.map(row => ({
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    currentPrice: row.priceUsd,
    change24h: row.change24h,
    marketCapRank: row.rank,
  }))
}

function fixtureSnapshotRows() {
  return toSnapshotRows(fixtureMarkets().markets)
}

function cardSource(source: QuoteRow['source']): 'live' | 'fixture' {
  return source === 'fixture' ? 'fixture' : 'live'
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
  source: 'live' | 'fixture'
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

export async function loadMarketRows(abortSignal?: AbortSignal): Promise<{
  rows: MarketRow[]
  source: 'live' | 'fixture'
}> {
  if (abortSignal?.aborted) return { rows: fixtureSnapshotRows(), source: 'fixture' }
  const { markets, source } = await getMarkets({})
  const rows = toSnapshotRows(markets)
  if (rows.length === 0) return { rows: fixtureSnapshotRows(), source: 'fixture' }
  return { rows, source: cardSource(source) }
}

function marketSnapshotTool(abortSignal?: AbortSignal) {
  return tool({
    description:
      'Returns a crypto market snapshot (prices and 24h change). Use when the user asks what moved, BTC, ETH, top coins, or a market overview. Optional query filters by symbol or name.',
    inputSchema: z.object({
      query: z.string().max(64).optional(),
    }),
    execute: async ({ query }: { query?: string }) => {
      const { rows, source } = await loadMarketRows(abortSignal)
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

export function createMarketSnapshotTool(
  abortSignal?: AbortSignal,
): ReturnType<typeof marketSnapshotTool> {
  return marketSnapshotTool(abortSignal)
}
