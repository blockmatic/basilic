import { describe, expect, it } from 'vitest'
import { fixtureAsset, fixtureMarkets, fixtureQuote } from './fixture.js'

describe('market fixtures', () => {
  it('filters fixture markets by ids and topN', () => {
    expect(fixtureMarkets({ ids: ['solana', 'missing'] }).markets.map(row => row.id)).toEqual([
      'solana',
    ])
    expect(fixtureMarkets({ topN: 1 }).markets.map(row => row.id)).toEqual(['bitcoin'])
  })

  it('returns no fixture markets for an unsatisfied category', () => {
    expect(fixtureMarkets({ category: 'layer-1' }).markets).toEqual([])
  })

  it('does not fall back to bitcoin for an unknown asset', () => {
    expect(() => fixtureQuote({ assetId: 'unknown' })).toThrow(/unavailable/)
    expect(() => fixtureAsset({ assetId: 'unknown' })).toThrow(/unavailable/)
  })

  it('keeps bitcoin when the asset id is bitcoin', () => {
    expect(fixtureQuote({ assetId: 'bitcoin' }).price).toBe(67_420.12)
    expect(fixtureAsset({ assetId: 'bitcoin' }).symbol).toBe('btc')
  })

  it('does not return usd fixture values for a non-usd vs', () => {
    expect(() => fixtureQuote({ assetId: 'bitcoin', vs: 'eur' })).toThrow(/unavailable/)
  })
})
