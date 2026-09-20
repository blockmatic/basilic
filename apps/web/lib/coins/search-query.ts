import type { ListCoinsData } from '@repo/core'
import {
  type inferParserType,
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'

const universeValues = ['all', 'majors', 'watchlist'] as const
const sortByValues = ['rank', 'change24h', 'volume', 'marketCap', 'price'] as const
const sortDirValues = ['asc', 'desc'] as const

export const searchQueryParsers = {
  universe: parseAsStringLiteral(universeValues).withDefault('all').withOptions({
    clearOnDefault: true,
  }),
  sortBy: parseAsStringLiteral(sortByValues)
    .withDefault('rank')
    .withOptions({ clearOnDefault: true }),
  sortDir: parseAsStringLiteral(sortDirValues).withDefault('asc').withOptions({
    clearOnDefault: true,
  }),
  symbols: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
  highlight: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
  text: parseAsString,
  topN: parseAsInteger,
  minChangePct: parseAsFloat,
  maxChangePct: parseAsFloat,
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,
}

export type SearchQueryState = inferParserType<typeof searchQueryParsers>

function compactStrings({ values }: { values: string[] }): string[] {
  return [...new Set(values.map(value => value.trim().toLowerCase()).filter(Boolean))]
}

export function toCoinsQuery({
  query,
}: {
  query: SearchQueryState
}): NonNullable<ListCoinsData['query']> {
  const symbols = compactStrings({ values: query.symbols })
  const highlight = compactStrings({ values: query.highlight })
  const text = query.text?.trim()
  return {
    ...(query.universe !== 'all' ? { universe: query.universe } : {}),
    ...(query.sortBy !== 'rank' ? { sortBy: query.sortBy } : {}),
    ...(query.sortDir !== 'asc' ? { sortDir: query.sortDir } : {}),
    ...(symbols.length > 0 ? { symbols } : {}),
    ...(highlight.length > 0 ? { highlight } : {}),
    ...(text ? { text } : {}),
    ...(query.topN != null ? { topN: query.topN } : {}),
    ...(query.minChangePct != null ? { minChangePct: query.minChangePct } : {}),
    ...(query.maxChangePct != null ? { maxChangePct: query.maxChangePct } : {}),
    ...(query.minPrice != null ? { minPrice: query.minPrice } : {}),
    ...(query.maxPrice != null ? { maxPrice: query.maxPrice } : {}),
  }
}

export function isSameSearchQuery({ a, b }: { a: SearchQueryState; b: SearchQueryState }): boolean {
  return JSON.stringify(toCoinsQuery({ query: a })) === JSON.stringify(toCoinsQuery({ query: b }))
}
