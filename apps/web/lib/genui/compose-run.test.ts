import type { Experimental_CompositionEvaluator } from '@json-render/core'
import { describe, expect, it } from 'vitest'
import { runComposeBoardSpec } from './compose-run'
import { defaultSearchQuery, emptyAccountState, viewFromSearchQuery } from './view-config'

const view = viewFromSearchQuery({ query: defaultSearchQuery, title: 'Top coins' })

function pickChoice({ keys, includeTable }: { keys: string[]; includeTable: boolean }): string {
  if (keys.includes('board')) return 'board'
  const table = keys.find(key => key.startsWith('use:table-'))
  if (table) return includeTable ? table : keys.includes('omit') ? 'omit' : table
  const useKey = keys.find(key => key.startsWith('use:') && key !== 'use:board')
  if (useKey) return useKey
  return keys.find(key => key !== 'omit' && key !== 'unavailable') ?? keys[0] ?? ''
}

function evaluator({ includeTable }: { includeTable: boolean }): Experimental_CompositionEvaluator {
  return async ({ questions }) => ({
    answers: Object.fromEntries(
      Object.entries(questions).map(([name, question]) => [
        name,
        { choice: pickChoice({ keys: Object.keys(question.criteria), includeTable }) },
      ]),
    ),
  })
}

describe('runComposeBoardSpec', () => {
  it('skips when the Gateway key is missing', async () => {
    await expect(
      runComposeBoardSpec({
        prompt: 'what moved?',
        view,
        caption: view.title,
        account: emptyAccountState,
        model: 'typesafe-ai/jev',
      }),
    ).resolves.toEqual({ skip: true, reason: 'missing-key' })
  })

  it('maps composed node ids onto allowlisted candidate ids', async () => {
    const result = await runComposeBoardSpec({
      prompt: 'show the ranked table',
      view,
      caption: view.title,
      account: emptyAccountState,
      model: 'typesafe-ai/jev',
      evaluate: evaluator({ includeTable: true }),
    })
    expect(result.skip).toBe(false)
    if (result.skip) return
    expect(result.elements).toContain('table-ranked')
    expect(result.elements).toContain('summary')
    expect(Object.values(result.spec.elements).some(element => element.type === 'DataTable')).toBe(
      true,
    )
  })

  it('skips when the finished spec has no table recipe', async () => {
    await expect(
      runComposeBoardSpec({
        prompt: 'profile only',
        view,
        caption: view.title,
        account: emptyAccountState,
        model: 'typesafe-ai/jev',
        evaluate: evaluator({ includeTable: false }),
      }),
    ).resolves.toEqual({ skip: true, reason: 'no-table' })
  })
})
