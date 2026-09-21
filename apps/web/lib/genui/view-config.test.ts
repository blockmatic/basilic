import { describe, expect, it } from 'vitest'
import { defaultSearchQuery, overlayAccountQuery } from './view-config'

describe('overlayAccountQuery', () => {
  it('forces watchlist when surface is account', () => {
    expect(overlayAccountQuery({ query: defaultSearchQuery, surface: 'account' }).universe).toBe(
      'watchlist',
    )
  })

  it('leaves table query unchanged', () => {
    expect(overlayAccountQuery({ query: defaultSearchQuery, surface: 'table' })).toEqual(
      defaultSearchQuery,
    )
  })
})
