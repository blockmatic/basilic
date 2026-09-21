import { experimental_evaluate } from 'ai'
import { Experimental_EvaluationMockModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import { evaluateBoardTurn } from './board-turn.js'
import { cannedSearchPatches } from './canned.js'

function mockAnswers({
  cannedIntent = 'movers',
}: {
  cannedIntent?: keyof typeof cannedSearchPatches
} = {}) {
  return {
    outOfSnapshot: { type: 'boolean' as const, probability: 0.05 },
    isPrediction: { type: 'boolean' as const, probability: 0.05 },
    cannedIntent: { type: 'choice' as const, choice: cannedIntent },
    surface: { type: 'choice' as const, choice: 'table' },
    turnType: { type: 'choice' as const, choice: 'board' },
  }
}

describe('evaluateBoardTurn', () => {
  it('skips when the model is null', async () => {
    expect(await evaluateBoardTurn({ prompt: 'what moved?', model: null })).toEqual({
      skip: 'missing-model',
    })
  })

  it('maps movers to the chip SearchQuery patch', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => ({ answers: mockAnswers(), warnings: [] }),
    })
    const result = await evaluateBoardTurn({ prompt: 'what moved?', model })
    expect('skip' in result ? result.skip : undefined).toBeUndefined()
    if ('cannedPatch' in result) expect(result.cannedPatch).toEqual(cannedSearchPatches.movers)
  })

  it('skips on 401', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => {
        throw Object.assign(new Error('unauthorized'), { statusCode: 401 })
      },
    })
    expect(await evaluateBoardTurn({ prompt: 'what moved?', model })).toEqual({ skip: 'upstream' })
  })

  it('skips on 429', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => {
        throw Object.assign(new Error('rate limited'), { statusCode: 429 })
      },
    })
    expect(await evaluateBoardTurn({ prompt: 'what moved?', model })).toEqual({ skip: 'upstream' })
  })

  it('skips on 529', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => {
        throw Object.assign(new Error('overloaded'), { statusCode: 529 })
      },
    })
    expect(await evaluateBoardTurn({ prompt: 'what moved?', model })).toEqual({ skip: 'upstream' })
  })

  it('skips on timeout', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => {
        const err = new Error('aborted')
        err.name = 'TimeoutError'
        throw err
      },
    })
    expect(await evaluateBoardTurn({ prompt: 'what moved?', model })).toEqual({ skip: 'upstream' })
  })

  it.skipIf(!process.env.AI_GATEWAY_API_KEY)(
    'evaluates a tiny prompt against Gateway',
    async () => {
      const result = await evaluateBoardTurn({ prompt: 'what moved?' })
      if ('skip' in result) expect(result.skip).toBe('upstream')
      else expect(result.answers.cannedIntent.choice).toBeTruthy()
    },
  )
})

describe('experimental_evaluate mock', () => {
  it('accepts the mock model', async () => {
    const model = new Experimental_EvaluationMockModelV4({
      doEvaluate: async () => ({
        answers: { refund: { type: 'boolean', probability: 0.9 } },
        warnings: [],
      }),
    })
    const result = await experimental_evaluate({
      model,
      state: 'refund please',
      questions: {
        refund: { type: 'boolean', instructions: 'Is this a refund ask?' },
      },
    })
    expect(result.answers.refund.probability).toBe(0.9)
  })
})
