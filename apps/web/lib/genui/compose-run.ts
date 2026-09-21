import {
  type Experimental_CompositionEvaluator,
  type Experimental_CompositionEvent,
  type Experimental_CompositionStep,
  experimental_composeSpec,
  experimental_createEvaluator,
  type Spec,
} from '@json-render/core'
import {
  boardCandidates,
  isTableRecipeId,
  recipeIdFromElement,
  tableIdFromChoice,
} from './candidates'
import { boardCatalog } from './catalog'
import type { AccountState, ViewConfig } from './view-config'

export type ComposeBoardResult =
  | { skip: false; spec: Spec; elements: string[]; stopReason: 'finish' }
  | {
      skip: true
      reason: 'missing-key' | 'unavailable' | 'limit' | 'no-table'
    }

function tableIdFromSteps({ steps }: { steps: Experimental_CompositionStep[] }) {
  for (const step of steps)
    for (const answer of Object.values(step.answers ?? {})) {
      const tableId = tableIdFromChoice({ choice: answer.choice })
      if (tableId) return tableId
    }
  return undefined
}

function elementsFromSpec({
  spec,
  steps,
}: {
  spec: Spec
  steps: Experimental_CompositionStep[]
}): string[] {
  const root = spec.elements[spec.root]
  const children = Array.isArray(root?.children)
    ? root.children.filter((id): id is string => typeof id === 'string')
    : Object.keys(spec.elements).filter(id => id !== spec.root)
  const tableId = tableIdFromSteps({ steps })
  const next: string[] = []
  const seen = new Set<string>()
  for (const id of children) {
    const element = spec.elements[id]
    if (!element) continue
    const recipeId = recipeIdFromElement({
      element,
      tableId: element.type === 'DataTable' ? tableId : undefined,
    })
    if (!recipeId || seen.has(recipeId)) continue
    seen.add(recipeId)
    next.push(recipeId)
  }
  return next
}

function specHasDataTable({ spec }: { spec: Spec }): boolean {
  return Object.values(spec.elements).some(element => element.type === 'DataTable')
}

export async function runComposeBoardSpec({
  prompt,
  view,
  caption,
  account,
  apiKey,
  model,
  evaluate,
}: {
  prompt: string
  view: ViewConfig
  caption: string
  account: AccountState
  apiKey?: string
  model: string
  evaluate?: Experimental_CompositionEvaluator
}): Promise<ComposeBoardResult> {
  const evaluator =
    evaluate ?? (apiKey ? experimental_createEvaluator({ apiKey, model }) : undefined)
  if (!evaluator) return { skip: true, reason: 'missing-key' }

  let complete: Extract<Experimental_CompositionEvent, { type: 'complete' }> | null = null

  for await (const event of experimental_composeSpec({
    catalog: boardCatalog,
    candidates: boardCandidates(),
    prompt,
    evaluate: evaluator,
    initialState: { caption, account },
    instructions: {
      root: 'Use the board stack as the root.',
      next: 'Always include one DataTable recipe. Prefer table-movers when the user asks what moved. Include account when the surface is the signed-in profile.',
    },
    context: { surface: view.surface, title: view.title },
  }))
    if (event.type === 'complete') complete = event

  if (!complete) return { skip: true, reason: 'unavailable' }
  if (complete.stopReason === 'unavailable') return { skip: true, reason: 'unavailable' }
  if (complete.stopReason === 'limit') return { skip: true, reason: 'limit' }
  if (!complete.spec || !specHasDataTable({ spec: complete.spec }))
    return { skip: true, reason: 'no-table' }

  const elements = elementsFromSpec({ spec: complete.spec, steps: complete.steps })
  if (!elements.some(id => isTableRecipeId(id))) return { skip: true, reason: 'no-table' }

  return {
    skip: false,
    spec: complete.spec,
    elements,
    stopReason: 'finish',
  }
}
