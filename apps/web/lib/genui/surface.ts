import {
  type inferParserType,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import {
  clearedSearchQuery,
  type SearchQueryState,
  searchQueryParsers,
} from '@/lib/coins/search-query'
import { periodValues, viewSurfaces } from './view-config'

const viewFieldOptions = { clearOnDefault: true } as const

export const surfaceParsers = {
  surface: parseAsStringLiteral(viewSurfaces).withDefault('table').withOptions(viewFieldOptions),
  period: parseAsStringLiteral(periodValues).withOptions(viewFieldOptions),
  columns: parseAsArrayOf(parseAsString).withDefault([]).withOptions(viewFieldOptions),
  elements: parseAsArrayOf(parseAsString).withDefault([]).withOptions(viewFieldOptions),
}

export const boardViewParsers = {
  ...searchQueryParsers,
  ...surfaceParsers,
}

export type BoardViewState = inferParserType<typeof boardViewParsers>

export const whoamiViewPatch = {
  ...clearedSearchQuery,
  universe: 'watchlist',
  surface: 'account',
  period: null,
  columns: null,
  elements: null,
} as const

export function splitBoardView({ view }: { view: BoardViewState }): {
  query: SearchQueryState
  surface: BoardViewState['surface']
  period: BoardViewState['period']
  columns: BoardViewState['columns']
  elements: BoardViewState['elements']
} {
  const { surface, period, columns, elements, ...query } = view
  return { query, surface, period, columns, elements }
}
