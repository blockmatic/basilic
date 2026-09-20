import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  defaultAnthropicModel,
  defaultOpenRouterModel,
  isAllowedRequestModel,
  resolveAnthropicModel,
  resolveOpenRouterModel,
  upgradeSonnetAnthropicModel,
  upgradeSonnetOpenRouterModel,
} from './provider.js'

describe('AI provider model resolution', () => {
  it('defaults Anthropic to Haiku when model is omitted', () => {
    expect(resolveAnthropicModel()).toBe(defaultAnthropicModel)
    expect(defaultAnthropicModel).toBe('claude-haiku-4-5')
    expect(defaultOpenRouterModel).toBe('anthropic/claude-haiku-4.5')
  })

  it('uses AI_DEFAULT_MODEL for OpenRouter when set in vitest.setup', () => {
    expect(process.env.AI_DEFAULT_MODEL).toBe('claude-haiku-4-5')
    expect(resolveOpenRouterModel()).toBe(process.env.AI_DEFAULT_MODEL)
  })

  it('maps sonnet alias to Sonnet 4.6 not Sonnet 5', () => {
    expect(resolveAnthropicModel('sonnet')).toBe(upgradeSonnetAnthropicModel)
    expect(resolveOpenRouterModel('sonnet')).toBe(upgradeSonnetOpenRouterModel)
    expect(upgradeSonnetAnthropicModel).toBe('claude-sonnet-4-6')
    expect(upgradeSonnetOpenRouterModel).toBe('anthropic/claude-sonnet-4.6')
  })

  it('maps retired Sonnet IDs to Sonnet 4.6', () => {
    expect(resolveAnthropicModel('claude-sonnet-4-20250514')).toBe(upgradeSonnetAnthropicModel)
  })

  it('honors defaultModel override for the OpenRouter haiku alias', () => {
    expect(resolveOpenRouterModel('haiku', { defaultModel: 'x-ai/grok-3-mini' })).toBe(
      'x-ai/grok-3-mini',
    )
    expect(resolveOpenRouterModel('sonnet', { defaultModel: 'x-ai/grok-3-mini' })).toBe(
      upgradeSonnetOpenRouterModel,
    )
  })
})

describe('isAllowedRequestModel', () => {
  it('allows omitted, default, haiku, and sonnet', () => {
    expect(isAllowedRequestModel({})).toBe(true)
    expect(isAllowedRequestModel({ model: 'default' })).toBe(true)
    expect(isAllowedRequestModel({ model: 'haiku' })).toBe(true)
    expect(isAllowedRequestModel({ model: 'sonnet' })).toBe(true)
    expect(isAllowedRequestModel({ model: defaultAnthropicModel })).toBe(true)
  })

  it('rejects opus and unknown ids without a resolved provider', () => {
    expect(isAllowedRequestModel({ model: 'opus' })).toBe(false)
    expect(isAllowedRequestModel({ model: 'gpt-4' })).toBe(false)
  })

  it('rejects concrete ids that the selected provider does not resolve', () => {
    expect(isAllowedRequestModel({ model: defaultOpenRouterModel, provider: 'anthropic' })).toBe(
      false,
    )
    expect(isAllowedRequestModel({ model: 'haiku', provider: 'ollama' })).toBe(false)
    expect(isAllowedRequestModel({ model: defaultOpenRouterModel, provider: 'ollama' })).toBe(false)
    expect(isAllowedRequestModel({ model: defaultOpenRouterModel, provider: 'openrouter' })).toBe(
      true,
    )
  })
})

describe('getResolvedProvider', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('../env.js')
  })

  it('returns null when no keys and no explicit Ollama URL', async () => {
    vi.resetModules()
    vi.doMock('../env.js', () => ({
      env: {
        ['AI_PROVIDER']: undefined,
        ['ANTHROPIC_API_KEY']: undefined,
        ['OPEN_ROUTER_API_KEY']: undefined,
        ['OLLAMA_BASE_URL']: undefined,
        ['AI_DEFAULT_MODEL']: undefined,
      },
    }))
    const { getResolvedProvider } = await import('./provider.js')
    expect(getResolvedProvider()).toBeNull()
  })
})
