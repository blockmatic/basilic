import { type Spec, validateSpec } from '@json-render/core'
import { isSameSearchQuery } from '@/lib/coins/search-query'
import { boardCatalog } from './catalog'
import {
  type ColumnId,
  columnIds,
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
  type ViewSurface,
} from './view-config'

const columnIdSet = new Set<string>(columnIds)

const rankedColumns: ColumnId[] = [
  'rank',
  'identity',
  'price',
  'change24h',
  'marketCap',
  'volume',
  'watch',
]
const moversColumns: ColumnId[] = ['identity', 'price', 'change24h', 'volume', 'watch']
const comparisonColumns: ColumnId[] = ['identity', 'price', 'change24h', 'marketCap', 'watch']

const honestyBySurface: Partial<Record<ViewSurface, string>> = {
  chart: 'Charting lands next.',
  news: "Headlines aren't a generated surface yet.",
  dashboard: 'Dashboards come later. Showing a table.',
  coin: 'No coin page yet. Highlighting that row.',
  account: 'Your profile. Favorites below. Onchain tokens appear after a wallet snapshot.',
}

const defaultView: ViewConfig = {
  version: 1,
  surface: 'table',
  title: '',
  query: defaultSearchQuery,
}

const leaf = { children: [] as string[] }

function resolveColumns({ view }: { view: ViewConfig }): ColumnId[] {
  if (view.columns?.length) {
    const subset = view.columns.filter((id): id is ColumnId => columnIdSet.has(id))
    if (subset.length) return subset
  }
  const symbols = view.query.symbols
  if (view.surface === 'comparison' || (symbols.length > 0 && symbols.length <= 5))
    return comparisonColumns
  if (view.query.sortBy === 'change24h') return moversColumns
  return rankedColumns
}

function buildSurfaceSpec({ view }: { view: ViewConfig }): Spec {
  const columns = resolveColumns({ view })
  const honesty = honestyBySurface[view.surface]
  const showReset = !isSameSearchQuery({ a: view.query, b: defaultSearchQuery })
  const emptyLabel = view.query.universe === 'watchlist' ? null : 'No market data available.'
  const boardChildren = [
    'summary',
    ...(honesty ? ['honesty'] : []),
    ...(view.surface === 'account' ? ['account'] : []),
    ...(showReset ? ['reset'] : []),
    'table',
  ]

  return {
    root: 'board',
    elements: {
      board: {
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: boardChildren,
      },
      summary: {
        type: 'QuerySummary',
        props: { caption: { $state: '/caption' } },
        ...leaf,
      },
      ...(honesty
        ? {
            honesty: {
              type: 'Alert',
              props: { variant: 'default', title: honesty, description: null },
              ...leaf,
            },
          }
        : {}),
      ...(view.surface === 'account'
        ? {
            account: {
              type: 'UserInfo',
              props: {
                name: null,
                email: null,
                image: null,
                username: null,
                joinedAt: null,
              },
              ...leaf,
            },
          }
        : {}),
      ...(showReset
        ? {
            reset: {
              type: 'Button',
              props: { label: 'Reset view', variant: 'outline' },
              on: { press: { action: 'reset_view' } },
              ...leaf,
            },
          }
        : {}),
      table: {
        type: 'DataTable',
        props: { columns, emptyLabel },
        repeat: { statePath: '/coins', key: 'id' },
        children: ['row'],
      },
      row: {
        type: 'Stack',
        props: { direction: 'horizontal', gap: 'md' },
        children: ['identity', 'price', 'change'],
      },
      identity: {
        type: 'CoinIdentity',
        props: {
          name: { $item: 'name' },
          symbol: { $item: 'symbol' },
          imageUrl: { $item: 'imageUrl' },
        },
        ...leaf,
      },
      price: {
        type: 'Price',
        props: { value: { $item: 'priceUsd' } },
        ...leaf,
      },
      change: {
        type: 'PercentageChange',
        props: { value: { $item: 'change24h' } },
        ...leaf,
      },
    },
  }
}

export function composeSurface({ view }: { view: ViewConfig }): Spec {
  const parsed = parseViewConfig({ value: view }) ?? defaultView
  const spec = buildSurfaceSpec({ view: parsed })
  const structural = validateSpec(spec)
  const catalogResult = boardCatalog.validate(spec)
  if (structural.valid && catalogResult.success) return spec
  return buildSurfaceSpec({ view: defaultView })
}
