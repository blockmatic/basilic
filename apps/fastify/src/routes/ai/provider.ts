import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'
import { env } from '../../lib/env.js'

export const defaultOllamaModel = 'qwen3:8b'
export const defaultOpenRouterModel = 'meta-llama/llama-3.3-70b-instruct:free'

export type ResolvedProvider = 'ollama' | 'openrouter'

export function getResolvedProvider(): ResolvedProvider | null {
  if (env.AI_PROVIDER === 'openrouter') {
    if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
    return null
  }
  if (env.AI_PROVIDER === 'ollama') {
    if (env.OLLAMA_BASE_URL) return 'ollama'
    return null
  }
  if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
  if (env.OLLAMA_BASE_URL) return 'ollama'
  return null
}

const openRouterModelAliases: Record<string, string> = {
  'aurora-alpha': defaultOpenRouterModel,
  'openrouter/free': defaultOpenRouterModel,
  grok: 'x-ai/grok-3-mini',
  'grok-3-mini': 'x-ai/grok-3-mini',
  sonnet: 'anthropic/claude-3-5-sonnet',
  opus: 'anthropic/claude-3-opus',
}

export function getProvider(provider: ResolvedProvider, modelParam?: string): LanguageModel {
  if (provider === 'ollama') {
    const defaultModel = env.AI_DEFAULT_MODEL ?? defaultOllamaModel
    const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
    const useDefault =
      m === undefined ||
      m === defaultOllamaModel ||
      m === 'aurora-alpha' ||
      m === 'default' ||
      m === 'qwen2.5:3b' ||
      m === 'qwen3:8b'
    const modelId = useDefault ? defaultModel : (m ?? defaultModel)
    const ollama = createOllama({
      baseURL: env.OLLAMA_BASE_URL,
    })
    return ollama(modelId)
  }
  const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
  const defaultModel = env.AI_DEFAULT_MODEL ?? defaultOpenRouterModel
  const useRuntimeDefault =
    m === undefined ||
    m === defaultOpenRouterModel ||
    m === 'aurora-alpha' ||
    m === 'default' ||
    m === 'openrouter/free'
  const effective = useRuntimeDefault ? defaultModel : (m ?? defaultModel)
  const modelId =
    openRouterModelAliases[effective] ??
    (effective.startsWith('gpt') ? `openai/${effective}` : effective)
  const apiKey = env.OPEN_ROUTER_API_KEY
  if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY required for Open Router')
  return createOpenRouter({ apiKey }).chat(modelId)
}
