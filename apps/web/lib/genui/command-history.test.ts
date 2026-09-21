import { describe, expect, it } from 'vitest'
import { parseCommandHistory, viewConfigToSearchPatch, whoamiViewConfig } from './command-history'

describe('parseCommandHistory', () => {
  it('restores valid command and viewConfig rows', () => {
    const viewConfig = whoamiViewConfig()
    const parsed = parseCommandHistory({
      value: JSON.stringify([{ command: 'Who am I?', viewConfig }]),
    })
    expect(parsed).toEqual([{ command: 'Who am I?', viewConfig }])
  })

  it('drops invalid JSON and unknown viewConfig', () => {
    expect(parseCommandHistory({ value: 'not-json' })).toEqual([])
    expect(
      parseCommandHistory({
        value: JSON.stringify([{ command: 'Who am I?', viewConfig: { surface: 'nope' } }]),
      }),
    ).toEqual([])
  })

  it('flattens surface period and columns onto the search patch', () => {
    expect(
      viewConfigToSearchPatch({
        viewConfig: {
          ...whoamiViewConfig(),
          period: '7d',
          columns: ['identity', 'price'],
          elements: ['summary', 'account', 'table-watchlist'],
        },
      }),
    ).toMatchObject({
      surface: 'account',
      universe: 'watchlist',
      period: '7d',
      columns: ['identity', 'price'],
      elements: ['summary', 'account', 'table-watchlist'],
    })
  })
})
