import { type Spec, validateSpec } from '@json-render/core'
import { isSameSearchQuery } from '@/lib/coins/search-query'
import {
  type BoardRecipeId,
  comparisonColumns,
  honestyIdForSurface,
  moversColumns,
  rankedColumns,
  recipeSpecElement,
} from './candidates'
import { boardCatalog } from './catalog'
import {
  type ColumnId,
  columnIds,
  defaultSearchQuery,
  parseViewConfig,
  type ViewConfig,
} from './view-config'

const columnIdSet = new Set<string>(columnIds)

const defaultView: ViewConfig = {
  version: 1,
  surface: 'table',
  title: '',
  query: defaultSearchQuery,
}

function sameColumns({ a, b }: { a: ColumnId[]; b: readonly ColumnId[] }): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function resolveColumns({ view }: { view: ViewConfig }): ColumnId[] {
  if (view.columns?.length) {
    const subset = view.columns.filter((id): id is ColumnId => columnIdSet.has(id))
    if (subset.length) return subset
  }
  const symbols = view.query.symbols
  if (view.surface === 'comparison' || (symbols.length > 0 && symbols.length <= 5))
    return [...comparisonColumns]
  if (view.query.sortBy === 'change24h') return [...moversColumns]
  return [...rankedColumns]
}

function resolveTableRecipeId({ view }: { view: ViewConfig }): BoardRecipeId {
  const columns = resolveColumns({ view })
  if (sameColumns({ a: columns, b: moversColumns })) return 'table-movers'
  if (sameColumns({ a: columns, b: comparisonColumns })) return 'table-comparison'
  if (view.query.universe === 'watchlist') return 'table-watchlist'
  return 'table-ranked'
}

function resolveChartRecipeId({ view }: { view: ViewConfig }): BoardRecipeId {
  if (view.chart === 'area') return 'chart-area'
  if (view.chart === 'bar') return 'chart-bar'
  if (view.chart === 'normalized') return 'chart-normalized'
  return 'chart-line'
}

function chromeRecipeIds({ view }: { view: ViewConfig }): BoardRecipeId[] {
  const honesty = honestyIdForSurface({ surface: view.surface })
  const showReset = !isSameSearchQuery({ a: view.query, b: defaultSearchQuery })
  const ids: BoardRecipeId[] = ['summary']
  if (honesty && view.surface !== 'chart') ids.push(honesty)
  if (view.surface === 'chart') ids.push(resolveChartRecipeId({ view }))
  if (view.surface === 'account')
    ids.push('account', 'token-table-all', 'nft-grid', 'wallet-link-cta')
  if (showReset) ids.push('reset')
  return ids
}

function buildSurfaceSpec({ view }: { view: ViewConfig }): Spec {
  const columns = resolveColumns({ view })
  const tableId = resolveTableRecipeId({ view })
  const chromeIds = chromeRecipeIds({ view })
  const childIds = [...chromeIds, tableId]
  const table = recipeSpecElement({ id: tableId, view })

  return {
    root: 'board',
    elements: {
      board: {
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: childIds,
      },
      ...Object.fromEntries(chromeIds.map(id => [id, recipeSpecElement({ id, view })])),
      [tableId]: {
        ...table,
        props: { ...table.props, columns },
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
