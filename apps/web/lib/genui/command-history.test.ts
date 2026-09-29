import { describe, expect, it } from 'vitest'
import {
  isActiveCommandHistoryEntry,
  parseCommandHistory,
  viewConfigToSearchPatch,
  whoamiViewConfig,
} from './command-history'
import { defaultSearchQuery } from './view-config'

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
          chart: 'area',
          columns: ['identity', 'price'],
          elements: ['summary', 'account', 'table-watchlist'],
        },
      }),
    ).toMatchObject({
      surface: 'account',
      universe: 'watchlist',
      period: '7d',
      chart: 'area',
      focus: null,
      columns: ['identity', 'price'],
      elements: ['summary', 'account', 'table-watchlist'],
    })
  })
})

describe('isActiveCommandHistoryEntry', () => {
  it('matches the current command and board view', () => {
    const viewConfig = whoamiViewConfig()
    expect(
      isActiveCommandHistoryEntry({
        entry: { command: 'Who am I?', viewConfig },
        q: 'Who am I?',
        view: {
          ...defaultSearchQuery,
          universe: 'watchlist',
          surface: 'account',
          period: null,
          chart: null,
          focus: null,
          columns: [],
          elements: [],
        },
      }),
    ).toBe(true)
  })

  it('rejects a different prompt or view', () => {
    const viewConfig = whoamiViewConfig()
    expect(
      isActiveCommandHistoryEntry({
        entry: { command: 'Who am I?', viewConfig },
        q: 'What moved?',
        view: {
          ...defaultSearchQuery,
          universe: 'watchlist',
          surface: 'account',
          period: null,
          chart: null,
          focus: null,
          columns: [],
          elements: [],
        },
      }),
    ).toBe(false)
    expect(
      isActiveCommandHistoryEntry({
        entry: { command: 'Who am I?', viewConfig },
        q: 'Who am I?',
        view: {
          ...defaultSearchQuery,
          surface: 'table',
          period: null,
          chart: null,
          focus: null,
          columns: [],
          elements: [],
        },
      }),
    ).toBe(false)
  })
})
