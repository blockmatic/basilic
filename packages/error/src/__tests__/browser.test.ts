import { logger } from '@repo/utils/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initSentry } from '../browser/sentry.js'

// Mock logger
vi.mock('@repo/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}))

// Mock Sentry - use vi.hoisted to define mock before hoisted mock factory
const { mockInit, mockGetClient } = vi.hoisted(() => ({
  mockInit: vi.fn(),
  mockGetClient: vi.fn<() => unknown>(() => null),
}))

vi.mock('@sentry/browser', () => ({
  init: mockInit,
  getClient: mockGetClient,
}))

describe('browser sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInit.mockClear()
  })

  describe('initSentry', () => {
    it('should initialize Sentry with DSN', () => {
      initSentry({
        dsn: 'https://test@test.ingest.sentry.io/test',
        environment: 'test',
      })

      expect(mockInit).toHaveBeenCalledWith({
        dsn: 'https://test@test.ingest.sentry.io/test',
        environment: 'test',
        release: undefined,
        tracesSampleRate: 1.0,
        beforeSend: undefined,
        ignoreErrors: [
          'ResizeObserver loop',
          'Non-Error promise rejection',
          'NetworkError',
          'Failed to fetch',
        ],
      })
    })

    it('should use production tracesSampleRate in production', () => {
      initSentry({
        dsn: 'https://test@test.ingest.sentry.io/test',
        environment: 'production',
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        }),
      )
    })

    it('should warn and not initialize if DSN is missing', () => {
      initSentry({})

      expect(logger.warn).toHaveBeenCalledWith(
        'Sentry DSN not configured - error reporting disabled',
      )
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should accept custom beforeSend hook', () => {
      const beforeSend = vi.fn()
      initSentry({
        dsn: 'https://test@test.ingest.sentry.io/test',
        beforeSend,
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeSend,
        }),
      )
    })
  })
})
