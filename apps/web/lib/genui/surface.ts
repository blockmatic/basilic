import { type inferParserType, parseAsStringLiteral } from 'nuqs/server'
import {
  clearedSearchQuery,
  type SearchQueryState,
  searchQueryParsers,
} from '@/lib/coins/search-query'
import { viewSurfaces } from './view-config'

export const surfaceParsers = {
  surface: parseAsStringLiteral(viewSurfaces).withDefault('table').withOptions({
    clearOnDefault: true,
  }),
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
} as const

export function splitBoardView({ view }: { view: BoardViewState }): {
  query: SearchQueryState
  surface: BoardViewState['surface']
} {
  const { surface, ...query } = view
  return { query, surface }
}
