import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'
import { env } from '../env.js'

export const defaultOllamaModel = 'qwen3:8b'
export const defaultOpenRouterModel = 'anthropic/claude-haiku-4.5'
export const defaultAnthropicModel = 'claude-haiku-4-5'
/** Explicit Sonnet tier when callers request `sonnet` (not the default — Haiku is cheaper). */
export const upgradeSonnetAnthropicModel = 'claude-sonnet-4-6'
export const upgradeSonnetOpenRouterModel = 'anthropic/claude-sonnet-4.6'

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
  if (env.ANTHROPIC_API_KEY) return defaultProvider
  if (env.OPEN_ROUTER_API_KEY) return 'openrouter'
  if (env.OLLAMA_BASE_URL) return 'ollama'
  return null
}

const openRouterFreeModel = 'meta-llama/llama-3.3-70b-instruct:free'
const openRouterModelAliases: Record<string, string> = {
  'openrouter/free': openRouterFreeModel,
  grok: 'x-ai/grok-3-mini',
  'grok-3-mini': 'x-ai/grok-3-mini',
  haiku: defaultOpenRouterModel,
  sonnet: upgradeSonnetOpenRouterModel,
}

const anthropicModelAliases: Record<string, string> = {
  haiku: defaultAnthropicModel,
  sonnet: upgradeSonnetAnthropicModel,
  'claude-3-5-sonnet': upgradeSonnetAnthropicModel,
  'claude-sonnet-4': upgradeSonnetAnthropicModel,
  'claude-sonnet-4-5': upgradeSonnetAnthropicModel,
  'claude-sonnet-4-6': upgradeSonnetAnthropicModel,
  'claude-sonnet-4-20250514': upgradeSonnetAnthropicModel,
}

function resolveModelParam({
  modelParam,
  runtimeDefault,
  defaultAliases,
  aliases,
  defaultModelOverride,
}: {
  modelParam?: string
  runtimeDefault: string
  defaultAliases: string[]
  aliases: Record<string, string>
  defaultModelOverride?: string
}): string {
  const defaultModel = defaultModelOverride ?? env.AI_DEFAULT_MODEL ?? runtimeDefault
  const m = (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined
  const useDefault =
    m === undefined || defaultAliases.includes(m) || m === defaultModel || m === runtimeDefault
  const effective = useDefault ? defaultModel : (m ?? defaultModel)
  return aliases[effective] ?? effective
}

export function resolveAnthropicModel(
  modelParam?: string,
  opts?: { defaultModel?: string },
): string {
  return resolveModelParam({
    modelParam,
    runtimeDefault: defaultAnthropicModel,
    defaultAliases: ['default', 'haiku'],
    aliases: anthropicModelAliases,
    defaultModelOverride: opts?.defaultModel,
  })
}

function resolveOllamaModel(modelParam?: string, opts?: { defaultModel?: string }): string {
  return resolveModelParam({
    modelParam,
    runtimeDefault: defaultOllamaModel,
    defaultAliases: ['default'],
    aliases: {},
    defaultModelOverride: opts?.defaultModel,
  })
}

export function resolveOpenRouterModel(
  modelParam?: string,
  opts?: { defaultModel?: string },
): string {
  const effective = resolveModelParam({
    modelParam,
    runtimeDefault: defaultOpenRouterModel,
    defaultAliases: ['default', 'haiku'],
    aliases: openRouterModelAliases,
    defaultModelOverride: opts?.defaultModel,
  })
  return (
    openRouterModelAliases[effective] ??
    (effective.startsWith('gpt') ? `openai/${effective}` : effective)
  )
}

export function isAllowedRequestModel({ model }: { model?: string }): boolean {
  const trimmed = model?.trim()
  if (!trimmed) return true
  const allowed = new Set([
    'default',
    'haiku',
    'sonnet',
    defaultAnthropicModel,
    defaultOpenRouterModel,
    defaultOllamaModel,
  ])
  if (env.AI_DEFAULT_MODEL) allowed.add(env.AI_DEFAULT_MODEL)
  return allowed.has(trimmed)
}

export function getProvider(provider: ResolvedProvider, modelParam?: string): LanguageModel {
  if (provider === 'anthropic') {
    const apiKey = env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for Anthropic')
    return createAnthropic({ apiKey })(resolveAnthropicModel(modelParam))
  }
  if (provider === 'ollama') {
    const baseURL = env.OLLAMA_BASE_URL
    if (!baseURL) throw new Error('OLLAMA_BASE_URL required for Ollama')
    return createOllama({ baseURL })(resolveOllamaModel(modelParam))
  }
  const apiKey = env.OPEN_ROUTER_API_KEY
  if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY required for Open Router')
  return createOpenRouter({ apiKey }).chat(resolveOpenRouterModel(modelParam))
}
