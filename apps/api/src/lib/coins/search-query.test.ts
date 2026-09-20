import { describe, expect, it } from 'vitest'
import { coerceSearchQuerystring, normalizeSearchQuery } from './search-query.js'

describe('coerceSearchQuerystring', () => {
  it('splits comma arrays and coerces numbers', () => {
    const query: Record<string, unknown> = {
      symbols: 'ETH, sol',
      minChangePct: '5',
      topN: '3',
    }
    coerceSearchQuerystring({ query })
    expect(query).toEqual({
      symbols: ['eth', 'sol'],
      minChangePct: 5,
      topN: 3,
    })
  })
})

describe('normalizeSearchQuery', () => {
  it('applies HTTP defaults', () => {
    expect(normalizeSearchQuery({ query: {} })).toEqual({
      universe: 'all',
      sortBy: 'rank',
      sortDir: 'asc',
    })
  })
})
