import { type Static, Type } from '@sinclair/typebox'

const csvKeys = ['symbols', 'highlight'] as const
const numberKeys = ['topN', 'minChangePct', 'maxChangePct', 'minPrice', 'maxPrice'] as const

export const SearchQuerySchema = Type.Object({
  universe: Type.Optional(
    Type.Union([Type.Literal('all'), Type.Literal('majors'), Type.Literal('watchlist')]),
  ),
  symbols: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  text: Type.Optional(Type.String({ minLength: 1 })),
  topN: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  sortBy: Type.Optional(
    Type.Union([
      Type.Literal('rank'),
      Type.Literal('change24h'),
      Type.Literal('volume'),
      Type.Literal('marketCap'),
      Type.Literal('price'),
    ]),
  ),
  sortDir: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')])),
  minChangePct: Type.Optional(Type.Number()),
  maxChangePct: Type.Optional(Type.Number()),
  minPrice: Type.Optional(Type.Number()),
  maxPrice: Type.Optional(Type.Number()),
  highlight: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
})

export type SearchQueryInput = Static<typeof SearchQuerySchema>

export type SearchQuery = {
  universe: 'all' | 'majors' | 'watchlist'
  sortBy: 'rank' | 'change24h' | 'volume' | 'marketCap' | 'price'
  sortDir: 'asc' | 'desc'
  symbols?: string[]
  text?: string
  topN?: number
  minChangePct?: number
  maxChangePct?: number
  minPrice?: number
  maxPrice?: number
  highlight?: string[]
}

export const CoinDtoSchema = Type.Object({
  id: Type.String(),
  symbol: Type.String(),
  name: Type.String(),
  imageUrl: Type.Union([Type.String(), Type.Null()]),
  priceUsd: Type.Number(),
  change24h: Type.Number(),
  volumeUsd: Type.Number(),
  marketCapUsd: Type.Number(),
  rank: Type.Integer(),
  fetchedAt: Type.String({ format: 'date-time' }),
  highlighted: Type.Boolean(),
})

export const CoinSyncSchema = Type.Object({
  source: Type.String(),
  fetchedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  lastError: Type.Union([Type.String(), Type.Null()]),
  stale: Type.Optional(Type.Boolean()),
  attribution: Type.Optional(Type.String()),
})

export const QueryCoinsResponseSchema = Type.Object({
  coins: Type.Array(CoinDtoSchema),
  sync: CoinSyncSchema,
  query: SearchQuerySchema,
  spokenSummary: Type.String(),
  queryCaption: Type.String(),
})

function splitCsv({ value }: { value: string }): string[] {
  return value
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeSymbols({ values }: { values?: string[] }): string[] | undefined {
  if (!values?.length) return undefined
  const next = [...new Set(values.map(value => value.trim().toLowerCase()).filter(Boolean))]
  return next.length > 0 ? next : undefined
}

export function coerceSearchQuerystring({ query }: { query: Record<string, unknown> }): void {
  for (const key of csvKeys) {
    const value = query[key]
    if (typeof value === 'string') query[key] = splitCsv({ value })
    else if (Array.isArray(value))
      query[key] = value.flatMap(item =>
        typeof item === 'string' ? splitCsv({ value: item }) : [],
      )
  }
  for (const key of numberKeys) {
    const value = query[key]
    if (typeof value !== 'string') continue
    if (value.trim() === '') {
      delete query[key]
      continue
    }
    const n = Number(value)
    if (Number.isFinite(n)) query[key] = n
  }
}

export function normalizeSearchQuery({ query }: { query: SearchQueryInput }): SearchQuery {
  const symbols = normalizeSymbols({ values: query.symbols })
  const highlight = normalizeSymbols({ values: query.highlight })
  const text = query.text?.trim()
  return {
    universe: query.universe ?? 'all',
    sortBy: query.sortBy ?? 'rank',
    sortDir: query.sortDir ?? 'asc',
    ...(symbols ? { symbols } : {}),
    ...(text ? { text } : {}),
    ...(query.topN != null ? { topN: query.topN } : {}),
    ...(query.minChangePct != null ? { minChangePct: query.minChangePct } : {}),
    ...(query.maxChangePct != null ? { maxChangePct: query.maxChangePct } : {}),
    ...(query.minPrice != null ? { minPrice: query.minPrice } : {}),
    ...(query.maxPrice != null ? { maxPrice: query.maxPrice } : {}),
    ...(highlight ? { highlight } : {}),
  }
}
