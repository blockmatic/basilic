import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'
import { env } from '../../lib/env.js'

export const defaultOllamaModel = 'qwen3:8b'
export const defaultOpenRouterModel = 'meta-llama/llama-3.3-70b-instruct:free'
export const defaultAnthropicModel = 'claude-3-5-sonnet-20241022'

export type ResolvedProvider = 'ollama' | 'openrouter' | 'anthropic'

export function getResolvedProvider(): ResolvedProvider | null {
  if (env.AI_PROVIDER === 'anthropic') {
    if (env.ANTHROPIC_API_KEY) return 'anthropic'
    return null
  }
  if (env.AI_PROVIDER === 'openrouter') {
    if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
    return null
  }
  if (env.AI_PROVIDER === 'ollama') {
    if (env.OLLAMA_BASE_URL) return 'ollama'
    return null
  }
  if (env.ANTHROPIC_API_KEY) return 'anthropic'
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

const anthropicModelAliases: Record<string, string> = {
  sonnet: defaultAnthropicModel,
  'claude-3-5-sonnet': defaultAnthropicModel,
}

function resolveAnthropicModel(modelParam?: string): string {
  const defaultModel = env.AI_DEFAULT_MODEL ?? defaultAnthropicModel
  const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
  const useDefault =
    m === undefined ||
    m === defaultAnthropicModel ||
    m === 'aurora-alpha' ||
    m === 'default' ||
    m === 'sonnet'
  return useDefault ? defaultModel : (anthropicModelAliases[m ?? ''] ?? m ?? defaultModel)
}

function resolveOllamaModel(modelParam?: string): string {
  const defaultModel = env.AI_DEFAULT_MODEL ?? defaultOllamaModel
  const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
  const useDefault =
    m === undefined || m === defaultOllamaModel || m === 'aurora-alpha' || m === 'default'
  return useDefault ? defaultModel : (m ?? defaultModel)
}

function resolveOpenRouterModel(modelParam?: string): string {
  const defaultModel = env.AI_DEFAULT_MODEL ?? defaultOpenRouterModel
  const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
  const useRuntimeDefault =
    m === undefined ||
    m === defaultOpenRouterModel ||
    m === 'aurora-alpha' ||
    m === 'default' ||
    m === 'openrouter/free'
  const effective = useRuntimeDefault ? defaultModel : (m ?? defaultModel)
  return (
    openRouterModelAliases[effective] ??
    (effective.startsWith('gpt') ? `openai/${effective}` : effective)
  )
}

export function getProvider(provider: ResolvedProvider, modelParam?: string): LanguageModel {
  if (provider === 'anthropic') {
    const apiKey = env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for Anthropic')
    return createAnthropic({ apiKey })(resolveAnthropicModel(modelParam))
  }
  if (provider === 'ollama')
    return createOllama({ baseURL: env.OLLAMA_BASE_URL })(resolveOllamaModel(modelParam))
  const apiKey = env.OPEN_ROUTER_API_KEY
  if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY required for Open Router')
  return createOpenRouter({ apiKey }).chat(resolveOpenRouterModel(modelParam))
}
