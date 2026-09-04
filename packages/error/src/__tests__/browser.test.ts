import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initErrorReporting } from '../browser/sentry.js'

const { mockInit } = vi.hoisted(() => ({
  mockInit: vi.fn(),
}))

vi.mock('@sentry/browser', () => ({
  init: mockInit,
}))

describe('browser error reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not initialize Sentry', () => {
    initErrorReporting({
      dsn: 'https://test@test.ingest.sentry.io/test',
      environment: 'test',
    })
    expect(mockInit).not.toHaveBeenCalled()
  })
})
