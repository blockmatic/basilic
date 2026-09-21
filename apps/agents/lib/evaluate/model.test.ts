import { afterEach, describe, expect, it, vi } from 'vitest'
import { cannedSearchPatches } from './canned.js'

describe('getEvaluationModel', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns null when Gateway key and OIDC token are unset', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
    vi.stubEnv('VERCEL_OIDC_TOKEN', '')
    const { getEvaluationModel } = await import('./model.js')
    expect(getEvaluationModel()).toBeNull()
  })

  it('returns a model instance when VERCEL_OIDC_TOKEN is set', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'oidc-test-token')
    const { getEvaluationModel } = await import('./model.js')
    expect(getEvaluationModel()).not.toBeNull()
  })
})

describe('cannedSearchPatches', () => {
  it('maps movers to the What moved chip SearchQuery', () => {
    expect(cannedSearchPatches.movers).toEqual({ sortBy: 'change24h', sortDir: 'desc' })
  })
})
