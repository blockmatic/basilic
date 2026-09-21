import { describe, expect, it } from 'vitest'
import { shouldApplyPostgresAtRuntime } from './migrate.js'

describe('shouldApplyPostgresAtRuntime', () => {
  it('skips production cold starts', () => {
    expect(shouldApplyPostgresAtRuntime({ nodeEnv: 'production' })).toBe(false)
  })

  it('skips Vercel Preview even in development', () => {
    expect(shouldApplyPostgresAtRuntime({ nodeEnv: 'development', vercelEnv: 'preview' })).toBe(
      false,
    )
  })

  it('applies in local development', () => {
    expect(shouldApplyPostgresAtRuntime({ nodeEnv: 'development' })).toBe(true)
  })

  it('applies when NODE_ENV is unset', () => {
    expect(shouldApplyPostgresAtRuntime({ nodeEnv: undefined, vercelEnv: undefined })).toBe(true)
  })
})
