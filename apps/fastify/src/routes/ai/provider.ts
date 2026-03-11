import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'
import { env } from '../../lib/env.js'

export const defaultOllamaModel = 'qwen3:8b'
export const defaultOpenRouterModel = 'anthropic/claude-sonnet-4'
export const defaultAnthropicModel = 'claude-sonnet-4-20250514'

/** Default provider when AI_PROVIDER is unset; Anthropic direct API is preferred. */
export const defaultProvider: ResolvedProvider = 'anthropic'

export type ResolvedProvider = 'ollama' | 'openrouter' | 'anthropic'

/**
 * Resolve AI provider from env. When AI_PROVIDER is unset, uses Anthropic → Open Router → Ollama.
 * Anthropic AI SDK (direct API) is the default; Open Router is fallback.
 */
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
  // Default: Anthropic direct API first, then Open Router, then Ollama
  if (env.ANTHROPIC_API_KEY) return defaultProvider
  if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
  if (env.OLLAMA_BASE_URL) return 'ollama'
  return null
}

const openRouterFreeModel = 'meta-llama/llama-3.3-70b-instruct:free'
const openRouterModelAliases: Record<string, string> = {
  'aurora-alpha': defaultOpenRouterModel,
  'openrouter/free': openRouterFreeModel,
  grok: 'x-ai/grok-3-mini',
  'grok-3-mini': 'x-ai/grok-3-mini',
  sonnet: defaultOpenRouterModel,
  opus: 'anthropic/claude-3-opus',
}

const anthropicModelAliases: Record<string, string> = {
  sonnet: defaultAnthropicModel,
  'claude-3-5-sonnet': defaultAnthropicModel,
  'claude-sonnet-4': defaultAnthropicModel,
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
    m === undefined || m === defaultOpenRouterModel || m === 'aurora-alpha' || m === 'default'
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
