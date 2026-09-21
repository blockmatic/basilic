import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'
import { env } from './env.js'

export type CommandProvider = 'anthropic' | 'openrouter' | 'ollama'

export function getResolvedCommandProvider(): CommandProvider | null {
  if (env.AI_PROVIDER === 'anthropic') return env.ANTHROPIC_API_KEY ? 'anthropic' : null
  if (env.AI_PROVIDER === 'openrouter') return env.OPEN_ROUTER_API_KEY ? 'openrouter' : null
  if (env.AI_PROVIDER === 'ollama') return env.OLLAMA_BASE_URL ? 'ollama' : null
  if (env.ANTHROPIC_API_KEY) return 'anthropic'
  if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
  if (env.OLLAMA_BASE_URL) return 'ollama'
  return null
}

export function getProvider(): LanguageModel | null {
  const provider = getResolvedCommandProvider()
  if (!provider) return null
  if (provider === 'anthropic') {
    const apiKey = env.ANTHROPIC_API_KEY
    if (!apiKey) return null
    return createAnthropic({ apiKey })(env.AI_DEFAULT_MODEL ?? 'claude-haiku-4-5')
  }
  if (provider === 'ollama') {
    const baseURL = env.OLLAMA_BASE_URL
    if (!baseURL) return null
    return createOllama({ baseURL })(env.AI_DEFAULT_MODEL ?? 'qwen3:8b')
  }
  const apiKey = env.OPEN_ROUTER_API_KEY
  if (!apiKey) return null
  return createOpenRouter({ apiKey }).chat(env.AI_DEFAULT_MODEL ?? 'anthropic/claude-haiku-4.5')
}

export const getCommandModel = getProvider
