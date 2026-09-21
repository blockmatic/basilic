import type { CannedIntent } from './canned.js'
import {
  defaultSearchQuery,
  type ViewConfig,
  type ViewSurface,
  viewFromSearchQuery,
} from './view-config.js'

export const refuseCopy =
  'This board only has a 24h market snapshot. Last-week percent, ATH, and price predictions are not available.'
export const adviseCopy =
  'Commands cannot give buy or sell advice. Switch to Chat to talk about the board.'
export const laterSurfaceCopy = 'That surface is not on the board yet. Showing a table instead.'

export type BoardTurnAnswers = {
  outOfSnapshot: { probability: number }
  isPrediction: { probability: number }
  cannedIntent: { choice: CannedIntent; probabilities?: Partial<Record<CannedIntent, number>> }
  surface: { choice: string; probabilities?: Record<string, number> }
  turnType: { choice: string; probabilities?: Record<string, number> }
}

export type ResolveCommandTurnResult =
  | { kind: 'tools' }
  | { kind: 'canned'; viewConfig: ViewConfig; honesty?: string }
  | { kind: 'refuse'; viewConfig: ViewConfig; honesty: string }
  | { kind: 'advise'; viewConfig: ViewConfig; honesty: string }

type SearchQuery = ViewConfig['query']

function choiceProbability({
  choice,
  probabilities,
}: {
  choice: string
  probabilities?: Record<string, number>
}) {
  return probabilities?.[choice]
}

function asSearchQuery({ value }: { value: unknown }): SearchQuery {
  const record =
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  return {
    universe:
      record.universe === 'majors' || record.universe === 'watchlist' ? record.universe : 'all',
    sortBy:
      record.sortBy === 'change24h' ||
      record.sortBy === 'volume' ||
      record.sortBy === 'marketCap' ||
      record.sortBy === 'price'
        ? record.sortBy
        : 'rank',
    sortDir: record.sortDir === 'desc' ? 'desc' : 'asc',
    symbols: Array.isArray(record.symbols) ? record.symbols.map(String) : [],
    highlight: Array.isArray(record.highlight) ? record.highlight.map(String) : [],
    text: typeof record.text === 'string' ? record.text : null,
    topN: typeof record.topN === 'number' ? record.topN : null,
    minChangePct: typeof record.minChangePct === 'number' ? record.minChangePct : null,
    maxChangePct: typeof record.maxChangePct === 'number' ? record.maxChangePct : null,
    minPrice: typeof record.minPrice === 'number' ? record.minPrice : null,
    maxPrice: typeof record.maxPrice === 'number' ? record.maxPrice : null,
  }
}

function mergeCannedQuery({
  boardQuery,
  patch,
}: {
  boardQuery: unknown
  patch: Record<string, unknown>
}): SearchQuery {
  const base = asSearchQuery({ value: boardQuery })
  const next = { ...base }
  if (patch.universe === 'all' || patch.universe === 'majors' || patch.universe === 'watchlist')
    next.universe = patch.universe
  if (
    patch.sortBy === 'rank' ||
    patch.sortBy === 'change24h' ||
    patch.sortBy === 'volume' ||
    patch.sortBy === 'marketCap' ||
    patch.sortBy === 'price'
  )
    next.sortBy = patch.sortBy
  if (patch.sortDir === 'asc' || patch.sortDir === 'desc') next.sortDir = patch.sortDir
  if (Object.keys(patch).length === 0) return { ...defaultSearchQuery }
  return next
}

function paintSurface({
  choice,
  probability,
  min,
}: {
  choice: string
  probability?: number
  min: number
}): {
  surface: ViewSurface
  honesty?: string
} {
  if (probability == null || probability < min) return { surface: 'table' }
  if (choice === 'account') return { surface: 'account' }
  if (choice === 'screener' || choice === 'comparison') return { surface: choice }
  if (choice === 'chart' || choice === 'dashboard') return { surface: choice }
  if (choice === 'news' || choice === 'coin') return { surface: 'table', honesty: laterSurfaceCopy }
  return { surface: 'table' }
}

export function resolveCommandTurn({
  answers,
  cannedPatch,
  boardQuery,
  cannedMinProbability,
  refuseMinProbability,
}: {
  answers: BoardTurnAnswers
  cannedPatch: Record<string, unknown> | null
  boardQuery?: unknown
  cannedMinProbability: number
  refuseMinProbability: number
}): ResolveCommandTurnResult {
  const current = viewFromSearchQuery({
    query: asSearchQuery({ value: boardQuery }),
    title: 'Board',
  })
  if (answers.outOfSnapshot.probability >= refuseMinProbability)
    return { kind: 'refuse', viewConfig: current, honesty: refuseCopy }
  if (answers.isPrediction.probability >= refuseMinProbability)
    return { kind: 'advise', viewConfig: current, honesty: adviseCopy }
  const turnTypeProb = choiceProbability({
    choice: answers.turnType.choice,
    probabilities: answers.turnType.probabilities,
  })
  if (
    answers.turnType.choice === 'advise' &&
    turnTypeProb != null &&
    turnTypeProb >= cannedMinProbability
  )
    return { kind: 'advise', viewConfig: current, honesty: adviseCopy }
  if (
    answers.turnType.choice === 'refuse' &&
    turnTypeProb != null &&
    turnTypeProb >= cannedMinProbability
  )
    return { kind: 'refuse', viewConfig: current, honesty: refuseCopy }
  const cannedProb = choiceProbability({
    choice: answers.cannedIntent.choice,
    probabilities: answers.cannedIntent.probabilities,
  })
  if (
    !cannedPatch ||
    answers.cannedIntent.choice === 'other' ||
    cannedProb == null ||
    cannedProb < cannedMinProbability
  )
    return { kind: 'tools' }
  const painted = paintSurface({
    choice: answers.surface.choice,
    probability: choiceProbability({
      choice: answers.surface.choice,
      probabilities: answers.surface.probabilities,
    }),
    min: cannedMinProbability,
  })
  const surface =
    cannedPatch.surface === 'account' || answers.cannedIntent.choice === 'whoami'
      ? 'account'
      : painted.surface
  const query = mergeCannedQuery({ boardQuery, patch: cannedPatch })
  const viewConfig = viewFromSearchQuery({
    query: surface === 'account' ? { ...query, universe: 'watchlist' } : query,
    title: surface === 'account' ? 'Your profile' : 'Board',
    surface,
  })
  return { kind: 'canned', viewConfig, honesty: painted.honesty }
}
