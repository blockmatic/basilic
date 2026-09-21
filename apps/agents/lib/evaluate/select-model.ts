import type { JSONValue } from 'ai'
import { env } from '../env.js'
import { getCommandModel } from '../provider.js'
import { evaluateBoardTurn } from './board-turn.js'
import { finishLanguageModel, setViewLanguageModel } from './canned-model.js'
import { resolveCommandTurn } from './resolve.js'

type ModelMessage = { role?: string; content?: unknown }

function textOf({ content }: { content: unknown }) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map(part => {
      if (typeof part !== 'object' || part === null || !('text' in part)) return ''
      return String((part as { text: unknown }).text)
    })
    .join('\n')
}

function partsOf({ content }: { content: unknown }) {
  return Array.isArray(content) ? content : []
}

export function lastUserPrompt({ messages }: { messages: ModelMessage[] }) {
  const texts = messages
    .filter(message => message.role === 'user')
    .map(message => textOf({ content: message.content }))
  for (let i = texts.length - 1; i >= 0; i--) {
    const text = texts[i]
    if (!text) continue
    try {
      const parsed = JSON.parse(text) as { boardQuery?: unknown }
      if (parsed && typeof parsed === 'object' && 'boardQuery' in parsed) continue
    } catch {
      return text
    }
    return text
  }
  return texts.at(-1) ?? ''
}

export function boardQueryFromMessages({
  messages,
}: {
  messages: ModelMessage[]
}): JSONValue | undefined {
  for (const message of messages) {
    if (message.role !== 'user') continue
    try {
      const parsed = JSON.parse(textOf({ content: message.content })) as { boardQuery?: JSONValue }
      if (parsed && typeof parsed === 'object' && 'boardQuery' in parsed) return parsed.boardQuery
    } catch {
      // not JSON — keep scanning user messages
    }
  }
}

export function hasSetViewCall({ messages }: { messages: ModelMessage[] }) {
  return messages.some(message =>
    partsOf({ content: message.content }).some(part => {
      if (typeof part !== 'object' || part === null) return false
      const record = part as { toolName?: unknown; type?: unknown }
      return record.toolName === 'set_view'
    }),
  )
}

export async function selectCommandLanguageModel({ messages }: { messages: ModelMessage[] }) {
  if (hasSetViewCall({ messages }))
    return { model: finishLanguageModel(), modelContextWindowTokens: 8_192 }
  const prompt = lastUserPrompt({ messages })
  const boardQuery = boardQueryFromMessages({ messages })
  const evaluated = await evaluateBoardTurn({ prompt, boardQuery })
  if (!('skip' in evaluated)) {
    const resolved = resolveCommandTurn({
      answers: evaluated.answers,
      cannedPatch: evaluated.cannedPatch as Record<string, unknown> | null,
      boardQuery,
      cannedMinProbability: env.JEV_CANNED_MIN_PROBABILITY,
      refuseMinProbability: env.JEV_REFUSE_MIN_PROBABILITY,
    })
    if (resolved.kind !== 'tools')
      return {
        model: setViewLanguageModel({
          input: {
            viewConfig: resolved.viewConfig,
            ...(resolved.honesty ? { honesty: resolved.honesty } : {}),
          },
        }),
        modelContextWindowTokens: 8_192,
      }
  }
  const model = getCommandModel()
  if (!model) throw new Error('command language model is not configured')
  return { model, modelContextWindowTokens: 200_000 }
}
