import { describe, expect, it } from 'vitest'
import {
  defaultAnthropicModel,
  defaultOpenRouterModel,
  resolveAnthropicModel,
  resolveOpenRouterModel,
  upgradeSonnetAnthropicModel,
  upgradeSonnetOpenRouterModel,
} from './provider.js'

describe('AI provider model resolution', () => {
  it('defaults to Haiku when model is omitted', () => {
    expect(resolveAnthropicModel()).toBe(defaultAnthropicModel)
    expect(resolveOpenRouterModel()).toBe(defaultOpenRouterModel)
    expect(defaultAnthropicModel).toBe('claude-haiku-4-5')
    expect(defaultOpenRouterModel).toBe('anthropic/claude-haiku-4.5')
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
