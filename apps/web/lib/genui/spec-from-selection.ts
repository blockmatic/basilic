import type { Spec } from '@json-render/core'
import {
  type BoardRecipeId,
  isBoardRecipeId,
  isChartRecipeId,
  isOverviewRecipeId,
  isTableRecipeId,
  recipeSpecElement,
} from './candidates'
import { composeSurface } from './compose'
import { parseViewConfig, type ViewConfig } from './view-config'

function uniqueRecipeIds({ ids }: { ids: string[] }): BoardRecipeId[] {
  const seen = new Set<string>()
  const next: BoardRecipeId[] = []
  for (const id of ids) {
    if (!isBoardRecipeId(id) || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }
  return next
}

export function specFromSelection({
  elements,
  view,
}: {
  elements: string[]
  view: ViewConfig
}): Spec {
  const parsed = parseViewConfig({ value: view }) ?? view
  const childIds = uniqueRecipeIds({ ids: elements })
  if (!childIds.some(id => isTableRecipeId(id) || isChartRecipeId(id) || isOverviewRecipeId(id)))
    return composeSurface({ view: parsed })

  return {
    root: 'board',
    elements: {
      board: {
        type: 'Stack',
        props: { direction: 'vertical', gap: 'md' },
        children: childIds,
      },
      ...Object.fromEntries(childIds.map(id => [id, recipeSpecElement({ id, view: parsed })])),
    },
  }
}
