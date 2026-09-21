import { logger } from '@repo/utils/logger/server'
import { type Experimental_EvaluationModel, experimental_evaluate, type JSONValue } from 'ai'
import { env } from '../env.js'
import { cannedSearchPatch } from './canned.js'
import { getEvaluationModel } from './model.js'

export const boardTurnQuestions = {
  outOfSnapshot: {
    type: 'boolean',
    instructions:
      'True if the ask needs a field this 24h CoinGecko snapshot cannot answer (ATH, this hour, last week percent, on-chain, news).',
  },
  isPrediction: {
    type: 'boolean',
    instructions: 'True if the user asks to predict price, pumps, or whether to buy or sell.',
  },
  cannedIntent: {
    type: 'choice',
    instructions:
      'Map typed paraphrases of board chips. Use other for novel filters, symbols, or follow-ups.',
    criteria: {
      movers: 'What moved / top gainers / 24h winners',
      losers: 'Biggest losers / dumpers / 24h down',
      volume: 'Sort by volume',
      majors: 'Only majors / BTC ETH SOL basket',
      watchlist: 'What is on my list / favorites',
      reset: 'Clear filters / show everything / default board',
      whoami: 'Who am I / account / profile',
      other: 'Anything else, including novel filters',
    },
  },
  surface: {
    type: 'choice',
    instructions:
      'Which closed GenUI surface would help. Unimplemented kinds still paint a table later.',
    criteria: {
      table: 'Default coin table / screener rows',
      screener: 'Filterable market list',
      comparison: 'Compare a few coins',
      chart: 'Price candles or series',
      news: 'Headlines',
      dashboard: 'Ephemeral market overview widgets (global metrics, trending, watchlist)',
      coin: 'Single-asset detail',
      account: 'Signed-in profile and watches',
      other: 'Unclear',
    },
  },
  turnType: {
    type: 'choice',
    instructions: 'How the product should treat this turn.',
    criteria: {
      board: 'Change the market board',
      account: 'Account or watchlist surface',
      advise: 'Investment advice or should-I-buy',
      refuse: 'Out of product / cannot answer honestly',
    },
  },
} as const

const skipStatuses = new Set([401, 429, 529])

function statusCodeOf(err: unknown) {
  if (typeof err !== 'object' || err === null || !('statusCode' in err)) return
  return typeof err.statusCode === 'number' ? err.statusCode : undefined
}

function isTimeout(err: unknown) {
  if (!(err instanceof Error)) return false
  return err.name === 'AbortError' || err.name === 'TimeoutError'
}

function isUpstreamSkip(err: unknown) {
  const status = statusCodeOf(err)
  if (status != null && skipStatuses.has(status)) return true
  return isTimeout(err)
}

export async function evaluateBoardTurn({
  prompt,
  boardQuery,
  model = getEvaluationModel(),
}: {
  prompt: string
  boardQuery?: JSONValue
  model?: Experimental_EvaluationModel | null
}) {
  if (!model) return { skip: 'missing-model' as const }

  try {
    const result = await experimental_evaluate({
      model,
      state: { prompt, boardQuery: boardQuery ?? null },
      questions: boardTurnQuestions,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(env.AI_EVALUATE_TIMEOUT_MS),
      providerOptions: {
        gateway: { zeroDataRetention: true, only: ['typesafe-ai'] },
      },
    })
    const intent = result.answers.cannedIntent.choice
    logger.info(
      {
        provider: 'gateway',
        cannedIntent: intent,
        surface: result.answers.surface.choice,
        turnType: result.answers.turnType.choice,
        outOfSnapshot: result.answers.outOfSnapshot.probability,
        isPrediction: result.answers.isPrediction.probability,
        generationId: result.response.id,
      },
      'evaluateBoardTurn',
    )
    return {
      answers: result.answers,
      cannedPatch: cannedSearchPatch({ intent }),
    }
  } catch (err) {
    if (!isUpstreamSkip(err)) throw err
    logger.warn({ provider: 'gateway', err }, 'evaluateBoardTurn skipped upstream')
    return { skip: 'upstream' as const }
  }
}
