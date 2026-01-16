import { logger } from '@repo/utils/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initSentry as initSentryBrowser } from '../browser/sentry.js'
import { initSentry as initSentryNextjs } from '../nextjs/sentry.js'
import { initSentry as initSentryNode } from '../node/sentry.js'

// Mock logger
vi.mock('@repo/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
  },
}))

// Mock Sentry - use vi.hoisted to define mocks before hoisted mock factories
const { mockInit, mockGetClient } = vi.hoisted(() => ({
  mockInit: vi.fn(),
  mockGetClient: vi.fn<() => unknown>(() => null),
}))

vi.mock('@sentry/node', () => ({
  init: mockInit,
  getClient: mockGetClient,
}))

vi.mock('@sentry/nextjs', () => ({
  init: mockInit,
  getClient: mockGetClient,
}))

vi.mock('@sentry/browser', () => ({
  init: mockInit,
  getClient: mockGetClient,
}))

describe('sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInit.mockClear()
  })

  describe.each([
    ['Node.js', initSentryNode],
    ['Next.js', initSentryNextjs],
    ['Browser', initSentryBrowser],
  ])('initSentry (%s)', (name, initSentry) => {
    it('should initialize Sentry with default config', () => {
      initSentry({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'test',
          tracesSampleRate: 1.0,
        }),
      )
    })

    it('should support optional custom beforeSend', () => {
      const customBeforeSend = vi.fn(event => event)

      initSentry({
        dsn: 'https://test@sentry.io/123',
        beforeSend: customBeforeSend,
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeSend: customBeforeSend,
        }),
      )
    })

    it('should warn if DSN is not provided', () => {
      initSentry({ dsn: undefined })

      expect(logger.warn).toHaveBeenCalledWith(
        'Sentry DSN not configured - error reporting disabled',
      )
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should use production tracesSampleRate for production environment', () => {
      initSentry({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        }),
      )
    })

    it('should use development tracesSampleRate for non-production', () => {
      initSentry({
        dsn: 'https://test@sentry.io/123',
        environment: 'development',
      })

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        }),
      )
    })

    it('should include ignoreErrors array', () => {
      initSentry({
        dsn: 'https://test@sentry.io/123',
      })

      const lastCall = mockInit.mock.calls[mockInit.mock.calls.length - 1]?.[0]
      if (name === 'Node.js') {
        expect(lastCall?.ignoreErrors).toEqual(['Non-Error promise rejection'])
      } else {
        expect(lastCall?.ignoreErrors).toEqual(
          expect.arrayContaining(['Non-Error promise rejection']),
        )
      }
    })
  })
})
