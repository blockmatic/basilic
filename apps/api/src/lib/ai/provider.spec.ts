import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  defaultGatewayModel,
  isAllowedRequestModel,
  resolveGatewayModel,
  upgradeSonnetGatewayModel,
} from './provider.js'

describe('AI provider model resolution', () => {
  it('defaults Gateway to Haiku when model is omitted', () => {
    expect(resolveGatewayModel()).toBe(defaultGatewayModel)
    expect(defaultGatewayModel).toBe('anthropic/claude-haiku-4.5')
  })

  it('maps sonnet alias to Sonnet 4.6', () => {
    expect(resolveGatewayModel('sonnet')).toBe(upgradeSonnetGatewayModel)
    expect(upgradeSonnetGatewayModel).toBe('anthropic/claude-sonnet-4.6')
  })

  it('honors defaultModel override for the haiku alias', () => {
    expect(resolveGatewayModel('haiku', { defaultModel: 'anthropic/claude-sonnet-4.6' })).toBe(
      'anthropic/claude-sonnet-4.6',
    )
    expect(resolveGatewayModel('sonnet', { defaultModel: 'x-ai/grok-3-mini' })).toBe(
      upgradeSonnetGatewayModel,
    )
  })
})

describe('isAllowedRequestModel', () => {
  it('allows omitted, default, haiku, sonnet, and Gateway ids', () => {
    expect(isAllowedRequestModel({})).toBe(true)
    expect(isAllowedRequestModel({ model: 'default' })).toBe(true)
    expect(isAllowedRequestModel({ model: 'haiku' })).toBe(true)
    expect(isAllowedRequestModel({ model: 'sonnet' })).toBe(true)
    expect(isAllowedRequestModel({ model: defaultGatewayModel })).toBe(true)
    expect(isAllowedRequestModel({ model: upgradeSonnetGatewayModel })).toBe(true)
  })

  it('rejects opus, unknown ids, and bare Anthropic ids', () => {
    expect(isAllowedRequestModel({ model: 'opus' })).toBe(false)
    expect(isAllowedRequestModel({ model: 'gpt-4' })).toBe(false)
    expect(isAllowedRequestModel({ model: 'claude-haiku-4-5' })).toBe(false)
    expect(isAllowedRequestModel({ model: 'qwen3:8b' })).toBe(false)
  })
})

describe('getResolvedProvider', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('../env.js')
  })

  it('returns null when Gateway credentials are unset', async () => {
    vi.resetModules()
    vi.doMock('../env.js', () => ({
      env: {
        // biome-ignore lint/style/useNamingConvention: mocked env keys match createEnv
        AI_GATEWAY_API_KEY: undefined,
        // biome-ignore lint/style/useNamingConvention: mocked env keys match createEnv
        VERCEL_OIDC_TOKEN: undefined,
        // biome-ignore lint/style/useNamingConvention: mocked env keys match createEnv
        AI_DEFAULT_MODEL: undefined,
      },
    }))
    const { getResolvedProvider } = await import('./provider.js')
    expect(getResolvedProvider()).toBeNull()
  })
})
