import type { Experimental_CompositionCandidate } from '@json-render/core'
import {
  type BoardRecipeId,
  boardRecipes,
  comparisonColumns,
  honestyBySurface,
  isChartRecipeId,
  isTableRecipeId,
  moversColumns,
} from './candidates'

function sameColumnList({ a, b }: { a: unknown; b: readonly string[] }): boolean {
  return Array.isArray(a) && a.length === b.length && a.every((id, index) => id === b[index])
}

export function tableIdFromChoice({ choice }: { choice: string }): BoardRecipeId | undefined {
  const id = choice.startsWith('use:') ? choice.slice(4) : choice
  return isTableRecipeId(id) ? id : undefined
}

function recipeIdFromChart({
  type,
  scale,
}: {
  type: string
  scale: unknown
}): BoardRecipeId | undefined {
  if (type === 'LineChart') return scale === 'normalized' ? 'chart-normalized' : 'chart-line'
  if (type === 'AreaChart') return 'chart-area'
  if (type === 'BarChart') return 'chart-bar'
  return undefined
}

function recipeIdFromAlert({ title }: { title: unknown }): BoardRecipeId | undefined {
  if (title === honestyBySurface.chart) return 'honesty-chart'
  if (title === honestyBySurface.news) return 'honesty-news'
  if (title === honestyBySurface.dashboard) return 'honesty-dashboard'
  if (title === honestyBySurface.coin) return 'honesty-coin'
  if (title === honestyBySurface.account) return 'honesty-account'
  return undefined
}

function recipeIdFromTable({
  columns,
  emptyLabel,
  tableId,
}: {
  columns: unknown
  emptyLabel: unknown
  tableId?: BoardRecipeId
}): BoardRecipeId {
  if (tableId && isTableRecipeId(tableId)) return tableId
  if (sameColumnList({ a: columns, b: moversColumns })) return 'table-movers'
  if (sameColumnList({ a: columns, b: comparisonColumns })) return 'table-comparison'
  if (emptyLabel == null) return 'table-watchlist'
  return 'table-ranked'
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
  if (element.type === 'TokenTable') {
    const network = element.props?.network
    if (network === 'eth-mainnet') return 'token-table-eth'
    if (network === 'base-mainnet') return 'token-table-base'
    return 'token-table-all'
  }
  if (element.type === 'NftGrid') return element.props?.hidden ? 'nft-hide' : 'nft-grid'
  if (element.type === 'Text') return 'wallet-link-cta'
  const chartId = recipeIdFromChart({ type: element.type, scale: element.props?.scale })
  if (chartId) return chartId
  if (element.type === 'Alert') return recipeIdFromAlert({ title: element.props?.title })
  if (element.type !== 'DataTable') return undefined
  return recipeIdFromTable({
    columns: element.props?.columns,
    emptyLabel: element.props?.emptyLabel,
    tableId,
  })
}

function candidateResource({ id }: { id: string }) {
  if (isTableRecipeId(id)) return 'table'
  if (isChartRecipeId(id)) return 'chart'
  if (id.startsWith('honesty-')) return 'honesty'
  if (id.startsWith('token-')) return 'tokens'
  if (id.startsWith('nft-')) return 'nfts'
  return undefined
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
      resource: candidateResource({ id }),
    })),
  ]
}
