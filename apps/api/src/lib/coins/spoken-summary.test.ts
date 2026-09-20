import { describe, expect, it } from 'vitest'
import { normalizeSearchQuery } from './search-query.js'
import { describeQuery, spokenSummary } from './spoken-summary.js'

const doge = { name: 'Dogecoin', change24h: 6.11 }
const bitcoin = { name: 'Bitcoin', change24h: 2.14 }
const ethereum = { name: 'Ethereum', change24h: -1.08 }
const fixtureSync = { source: 'fixture', fetchedAt: null, lastError: null }

describe('spokenSummary', () => {
  it('mentions Doge for minChangePct 5 without dollar amounts', () => {
    const query = normalizeSearchQuery({ query: { minChangePct: 5 } })
    const text = spokenSummary({ coins: [doge], query, sync: fixtureSync })
    expect(text.toLowerCase()).toContain('doge')
    expect(text.toLowerCase()).toContain('six percent')
    expect(text.length).toBeLessThanOrEqual(320)
    expect(text).not.toContain('$')
  })

  it('returns empty watchlist copy', () => {
    const query = normalizeSearchQuery({ query: { universe: 'watchlist' } })
    expect(spokenSummary({ coins: [], query, sync: fixtureSync, watchlistEmpty: true })).toBe(
      'Your list is empty.',
    )
  })

  it('returns empty filter copy when the watchlist has rows', () => {
    const query = normalizeSearchQuery({ query: { universe: 'watchlist', text: 'nope' } })
    expect(spokenSummary({ coins: [], query, sync: fixtureSync, watchlistEmpty: false })).toBe(
      'Nothing matches that filter.',
    )
  })

  it('returns empty filter copy', () => {
    const query = normalizeSearchQuery({ query: { text: 'nope' } })
    expect(spokenSummary({ coins: [], query, sync: fixtureSync })).toBe(
      'Nothing matches that filter.',
    )
  })

  it('names the first coins on default rank', () => {
    const query = normalizeSearchQuery({ query: {} })
    const text = spokenSummary({
      coins: [bitcoin, ethereum, doge],
      query,
      sync: fixtureSync,
    })
    expect(text).toContain('Bitcoin')
    expect(text).toContain('Ethereum')
  })
})

describe('describeQuery', () => {
  it('mentions movers for change24h desc without row names', () => {
    const query = normalizeSearchQuery({ query: { sortBy: 'change24h', sortDir: 'desc' } })
    const caption = describeQuery({ query })
    expect(caption.toLowerCase()).toMatch(/mover|change/)
    expect(caption.toLowerCase()).not.toContain('doge')
  })

  it('keeps non-negative minChangePct wording', () => {
    const query = normalizeSearchQuery({ query: { minChangePct: 5 } })
    expect(describeQuery({ query }).toLowerCase()).toContain('up at least five percent')
  })

  it('preserves a negative minChangePct sign', () => {
    const query = normalizeSearchQuery({ query: { minChangePct: -5 } })
    expect(describeQuery({ query }).toLowerCase()).toContain('change at least minus five percent')
  })
})
