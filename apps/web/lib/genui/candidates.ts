import type { Experimental_CompositionCandidate } from '@json-render/core'
import type { ColumnId, ViewConfig, ViewSurface } from './view-config'

const leaf = { children: [] as string[] }

export const rankedColumns: ColumnId[] = [
  'rank',
  'identity',
  'price',
  'change24h',
  'marketCap',
  'volume',
  'watch',
]
export const moversColumns: ColumnId[] = ['identity', 'price', 'change24h', 'volume', 'watch']
export const comparisonColumns: ColumnId[] = [
  'identity',
  'price',
  'change24h',
  'marketCap',
  'watch',
]

export const honestyBySurface: Partial<Record<ViewSurface, string>> = {
  chart: 'Charting lands next.',
  news: "Headlines aren't a generated surface yet.",
  dashboard: 'Dashboards come later. Showing a table.',
  coin: 'No coin page yet. Highlighting that row.',
  account: 'Your profile. Favorites below. Onchain tokens appear after a wallet snapshot.',
}

export const honestyCandidateIds = {
  chart: 'honesty-chart',
  news: 'honesty-news',
  dashboard: 'honesty-dashboard',
  coin: 'honesty-coin',
  account: 'honesty-account',
} as const satisfies Partial<Record<ViewSurface, string>>

const summaryElement = {
  type: 'QuerySummary',
  props: { caption: { $state: '/caption' } },
}

const accountElement = {
  type: 'UserInfo',
  props: {
    name: { $state: '/account/name' },
    email: { $state: '/account/email' },
    image: { $state: '/account/image' },
    username: { $state: '/account/username' },
    joinedAt: { $state: '/account/joinedAt' },
  },
}

const resetElement = {
  type: 'Button',
  props: { label: 'Reset view', variant: 'outline' },
  on: { press: { action: 'reset_view' } },
}

function honestyElement({ title }: { title: string }) {
  return { type: 'Alert', props: { variant: 'default', title, description: null } }
}

function tableElement({ columns }: { columns: ColumnId[] }) {
  return {
    type: 'DataTable',
    props: { columns, emptyLabel: 'No market data available.' },
  }
}

export const boardRecipes = {
  summary: { element: summaryElement, description: 'Caption of the current SearchQuery' },
  account: { element: accountElement, description: 'Signed-in profile card' },
  reset: { element: resetElement, description: 'Clear filters back to the ranked table' },
  'honesty-chart': {
    element: honestyElement({ title: honestyBySurface.chart ?? '' }),
    description: 'Honesty notice that charting is not shipped',
  },
  'honesty-news': {
    element: honestyElement({ title: honestyBySurface.news ?? '' }),
    description: 'Honesty notice that headlines are not a generated surface',
  },
  'honesty-dashboard': {
    element: honestyElement({ title: honestyBySurface.dashboard ?? '' }),
    description: 'Honesty notice that dashboards come later',
  },
  'honesty-coin': {
    element: honestyElement({ title: honestyBySurface.coin ?? '' }),
    description: 'Honesty notice that coin pages are not shipped',
  },
  'honesty-account': {
    element: honestyElement({ title: honestyBySurface.account ?? '' }),
    description: 'Honesty notice under the account card',
  },
  'table-ranked': {
    element: tableElement({ columns: rankedColumns }),
    description: 'Ranked market table with cap, volume, and watch',
  },
  'table-movers': {
    element: tableElement({ columns: moversColumns }),
    description: 'Movers table emphasizing 24h change and volume',
  },
  'table-comparison': {
    element: tableElement({ columns: comparisonColumns }),
    description: 'Short comparison table for a few symbols',
  },
  'table-watchlist': {
    element: tableElement({ columns: rankedColumns }),
    description: 'Favorites table; empty watchlist stays honest',
  },
} as const

export const tableCandidateIds = [
  'table-ranked',
  'table-movers',
  'table-comparison',
  'table-watchlist',
] as const

export type BoardRecipeId = keyof typeof boardRecipes

export const recipeIdSet = new Set<string>(Object.keys(boardRecipes))

export function isBoardRecipeId(id: string): id is BoardRecipeId {
  return recipeIdSet.has(id)
}

export function isTableRecipeId(id: string): id is (typeof tableCandidateIds)[number] {
  return tableCandidateIds.includes(id as (typeof tableCandidateIds)[number])
}

function sameColumnList({ a, b }: { a: unknown; b: readonly string[] }): boolean {
  return Array.isArray(a) && a.length === b.length && a.every((id, index) => id === b[index])
}

export function tableIdFromChoice({ choice }: { choice: string }): BoardRecipeId | undefined {
  const id = choice.startsWith('use:') ? choice.slice(4) : choice
  return isTableRecipeId(id) ? id : undefined
}

export function recipeIdFromElement({
  element,
  tableId,
}: {
  element: { type: string; props?: Record<string, unknown> }
  tableId?: BoardRecipeId
}): BoardRecipeId | undefined {
  if (element.type === 'QuerySummary') return 'summary'
  if (element.type === 'UserInfo') return 'account'
  if (element.type === 'Button') return 'reset'
  if (element.type === 'Alert') {
    const title = element.props?.title
    if (title === honestyBySurface.chart) return 'honesty-chart'
    if (title === honestyBySurface.news) return 'honesty-news'
    if (title === honestyBySurface.dashboard) return 'honesty-dashboard'
    if (title === honestyBySurface.coin) return 'honesty-coin'
    if (title === honestyBySurface.account) return 'honesty-account'
    return undefined
  }
  if (element.type !== 'DataTable') return undefined
  if (tableId && isTableRecipeId(tableId)) return tableId
  const columns = element.props?.columns
  if (sameColumnList({ a: columns, b: moversColumns })) return 'table-movers'
  if (sameColumnList({ a: columns, b: comparisonColumns })) return 'table-comparison'
  if (element.props?.emptyLabel == null) return 'table-watchlist'
  return 'table-ranked'
}

export function honestyIdForSurface({
  surface,
}: {
  surface: ViewSurface
}): (typeof honestyCandidateIds)[keyof typeof honestyCandidateIds] | undefined {
  if (surface === 'chart') return honestyCandidateIds.chart
  if (surface === 'news') return honestyCandidateIds.news
  if (surface === 'dashboard') return honestyCandidateIds.dashboard
  if (surface === 'coin') return honestyCandidateIds.coin
  if (surface === 'account') return honestyCandidateIds.account
  return undefined
}

export function tableEmptyLabel({ view }: { view: ViewConfig }): string | null {
  return view.query.universe === 'watchlist' ? null : 'No market data available.'
}

export function recipeSpecElement({ id, view }: { id: BoardRecipeId; view: ViewConfig }) {
  const recipe = boardRecipes[id]
  const element = recipe.element
  if (element.type !== 'DataTable') return { ...element, ...leaf }
  return {
    ...element,
    props: { ...element.props, emptyLabel: tableEmptyLabel({ view }) },
    ...leaf,
  }
}

export function boardCandidates(): Experimental_CompositionCandidate[] {
  return [
    {
      id: 'board',
      description: 'Vertical stack that holds board chrome and one table',
      element: { type: 'Stack', props: { direction: 'vertical', gap: 'md' } },
      root: true,
    },
    ...Object.entries(boardRecipes).map(([id, recipe]) => ({
      id,
      description: recipe.description,
      element: recipe.element,
      root: false as const,
      resource: isTableRecipeId(id) ? 'table' : id.startsWith('honesty-') ? 'honesty' : undefined,
    })),
  ]
}
