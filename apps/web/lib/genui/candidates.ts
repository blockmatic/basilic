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
  chart: 'No Binance market for this asset. Showing the table.',
  news: "Headlines aren't a generated surface yet.",
  dashboard: 'Ephemeral overview. Nothing is pinned.',
  coin: 'No coin page yet. Highlighting that row.',
  account: 'Your profile. Favorites below. Linked wallet tokens load live from Alchemy.',
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

const tokenTableElement = {
  type: 'TokenTable',
  props: { network: 'all' as const },
}

const nftGridElement = {
  type: 'NftGrid',
  props: { hidden: false },
}

const walletLinkElement = {
  type: 'Text',
  props: { text: 'Link an Ethereum wallet in Settings to load tokens.', tone: 'muted' as const },
}

const trendingTableElement = {
  type: 'TrendingTable',
  props: {},
}

function metricElement({
  field,
  label,
}: {
  field: 'btcDominance' | 'marketCapUsd' | 'volumeUsd'
  label: string
}) {
  return { type: 'MetricTile', props: { field, label } }
}

export const boardRecipes = {
  summary: { element: summaryElement, description: 'Caption of the current SearchQuery' },
  account: { element: accountElement, description: 'Signed-in profile card' },
  reset: { element: resetElement, description: 'Clear filters back to the ranked table' },
  'honesty-chart': {
    element: honestyElement({ title: honestyBySurface.chart ?? '' }),
    description: 'Honesty notice when this asset has no Binance pair',
  },
  'honesty-news': {
    element: honestyElement({ title: honestyBySurface.news ?? '' }),
    description: 'Honesty notice that headlines are not a generated surface',
  },
  'honesty-dashboard': {
    element: honestyElement({ title: honestyBySurface.dashboard ?? '' }),
    description: 'Honesty notice that overview widgets are not pinned',
  },
  'metric-btc-d': {
    element: metricElement({ field: 'btcDominance', label: 'BTC dominance' }),
    description: 'BTC.D metric tile bound to $state.global',
  },
  'metric-market-cap': {
    element: metricElement({ field: 'marketCapUsd', label: 'Total market cap' }),
    description: 'Total crypto market cap tile bound to $state.global',
  },
  'metric-volume': {
    element: metricElement({ field: 'volumeUsd', label: '24h volume' }),
    description: 'Global 24h volume tile bound to $state.global',
  },
  'table-trending': {
    element: trendingTableElement,
    description: 'Trending coins bound to $state.trending',
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
  'token-table-all': {
    element: tokenTableElement,
    description: 'Linked wallet tokens on eth and base',
  },
  'token-table-eth': {
    element: { type: 'TokenTable', props: { network: 'eth-mainnet' as const } },
    description: 'Linked wallet tokens on Ethereum',
  },
  'token-table-base': {
    element: { type: 'TokenTable', props: { network: 'base-mainnet' as const } },
    description: 'Linked wallet tokens on Base',
  },
  'nft-grid': {
    element: nftGridElement,
    description: 'Linked wallet NFTs as a grid',
  },
  'nft-hide': {
    element: { type: 'NftGrid', props: { hidden: true } },
    description: 'Hide NFT grid',
  },
  'wallet-link-cta': {
    element: walletLinkElement,
    description: 'Prompt to link an Ethereum wallet in Settings',
  },
  'chart-line': {
    element: { type: 'LineChart', props: { scale: 'price' as const } },
    description: 'Close price line chart bound to $state.series',
  },
  'chart-area': {
    element: { type: 'AreaChart', props: {} },
    description: 'Close price area chart bound to $state.series',
  },
  'chart-bar': {
    element: { type: 'BarChart', props: {} },
    description: 'Close price bar chart bound to $state.series',
  },
  'chart-normalized': {
    element: { type: 'LineChart', props: { scale: 'normalized' as const } },
    description: 'Normalized close line chart bound to $state.series',
  },
} as const

export const tableCandidateIds = [
  'table-ranked',
  'table-movers',
  'table-comparison',
  'table-watchlist',
] as const

export const chartCandidateIds = [
  'chart-line',
  'chart-area',
  'chart-bar',
  'chart-normalized',
] as const

export const metricCandidateIds = ['metric-btc-d', 'metric-market-cap', 'metric-volume'] as const

export const overviewCandidateIds = [...metricCandidateIds, 'table-trending'] as const

export type BoardRecipeId = keyof typeof boardRecipes

export const recipeIdSet = new Set<string>(Object.keys(boardRecipes))

export function isBoardRecipeId(id: string): id is BoardRecipeId {
  return recipeIdSet.has(id)
}

export function isTableRecipeId(id: string): id is (typeof tableCandidateIds)[number] {
  return tableCandidateIds.includes(id as (typeof tableCandidateIds)[number])
}

export function isChartRecipeId(id: string): id is (typeof chartCandidateIds)[number] {
  return chartCandidateIds.includes(id as (typeof chartCandidateIds)[number])
}

export function isOverviewRecipeId(id: string): id is (typeof overviewCandidateIds)[number] {
  return overviewCandidateIds.includes(id as (typeof overviewCandidateIds)[number])
}

export function honestyIdForSurface({
  surface,
}: {
  surface: ViewSurface
}): (typeof honestyCandidateIds)[keyof typeof honestyCandidateIds] | undefined {
  if (surface === 'chart') return honestyCandidateIds.chart
  if (surface === 'news') return honestyCandidateIds.news
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
