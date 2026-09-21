import { describe, expect, it } from 'vitest'
import { adviseCopy, refuseCopy, resolveCommandTurn } from './resolve.js'
import { defaultSearchQuery } from './view-config.js'

function answers(
  overrides: Parameters<typeof resolveCommandTurn>[0]['answers'] extends infer T
    ? Partial<T>
    : never,
) {
  return {
    outOfSnapshot: { probability: 0.05 },
    isPrediction: { probability: 0.05 },
    cannedIntent: { choice: 'other' as const, probabilities: { other: 0.9 } },
    surface: { choice: 'table', probabilities: { table: 0.9 } },
    turnType: { choice: 'board', probabilities: { board: 0.9 } },
    ...overrides,
  }
}

const thresholds = { cannedMinProbability: 0.8, refuseMinProbability: 0.8 }

describe('resolveCommandTurn', () => {
  it('refuses high outOfSnapshot noul without pretending last week is change24h', () => {
    const result = resolveCommandTurn({
      answers: answers({ outOfSnapshot: { probability: 0.91 } }),
      cannedPatch: { sortBy: 'change24h', sortDir: 'desc' },
      ...thresholds,
    })
    expect(result).toMatchObject({ kind: 'refuse', honesty: refuseCopy })
    if (result.kind === 'refuse') expect(result.viewConfig.query.sortBy).toBe('rank')
  })

  it('advises high isPrediction noul', () => {
    expect(
      resolveCommandTurn({
        answers: answers({ isPrediction: { probability: 0.9 } }),
        cannedPatch: null,
        ...thresholds,
      }),
    ).toMatchObject({ kind: 'advise', honesty: adviseCopy })
  })

  it('falls through when canned probability is missing or low', () => {
    expect(
      resolveCommandTurn({
        answers: answers({ cannedIntent: { choice: 'movers' } }),
        cannedPatch: { sortBy: 'change24h', sortDir: 'desc' },
        ...thresholds,
      }),
    ).toEqual({ kind: 'tools' })
    expect(
      resolveCommandTurn({
        answers: answers({
          cannedIntent: { choice: 'movers', probabilities: { movers: 0.51 } },
        }),
        cannedPatch: { sortBy: 'change24h', sortDir: 'desc' },
        ...thresholds,
      }),
    ).toEqual({ kind: 'tools' })
  })

  it('maps high-confidence movers onto the current query', () => {
    const result = resolveCommandTurn({
      answers: answers({
        cannedIntent: { choice: 'movers', probabilities: { movers: 0.92 } },
      }),
      cannedPatch: { sortBy: 'change24h', sortDir: 'desc' },
      boardQuery: { ...defaultSearchQuery, universe: 'majors' },
      ...thresholds,
    })
    expect(result.kind).toBe('canned')
    if (result.kind !== 'canned') return
    expect(result.viewConfig.query).toMatchObject({
      universe: 'majors',
      sortBy: 'change24h',
      sortDir: 'desc',
    })
  })

  it('maps whoami to account watchlist', () => {
    const result = resolveCommandTurn({
      answers: answers({
        cannedIntent: { choice: 'whoami', probabilities: { whoami: 0.95 } },
        surface: { choice: 'account', probabilities: { account: 0.9 } },
      }),
      cannedPatch: { universe: 'watchlist', surface: 'account' },
      ...thresholds,
    })
    expect(result.kind).toBe('canned')
    if (result.kind !== 'canned') return
    expect(result.viewConfig.surface).toBe('account')
    expect(result.viewConfig.query.universe).toBe('watchlist')
  })
})
