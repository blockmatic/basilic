import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initErrorReporting as initErrorReportingBrowser } from '../browser/sentry.js'
import { initErrorReporting as initErrorReportingNextjs } from '../nextjs/sentry.js'
import { initErrorReporting as initErrorReportingNode } from '../node/sentry.js'

// Mock logger - use vi.hoisted to define mocks before hoisted mock factories
const { mockLoggerWarn } = vi.hoisted(() => ({
  mockLoggerWarn: vi.fn(),
}))

vi.mock('@repo/utils/logger/server', () => ({
  logger: {
    warn: mockLoggerWarn,
  },
}))
vi.mock('@repo/utils/logger/client', () => ({
  logger: {
    warn: mockLoggerWarn,
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

describe('error reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInit.mockClear()
  })

  describe.each([
    ['Node.js', initErrorReportingNode],
    ['Next.js', initErrorReportingNextjs],
    ['Browser', initErrorReportingBrowser],
  ])('initErrorReporting (%s)', (name, initErrorReporting) => {
    it('should initialize with default config', () => {
      initErrorReporting({
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

      initErrorReporting({
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
      initErrorReporting({ dsn: undefined })

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'Error reporting DSN not configured - error reporting disabled',
      )
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should use production tracesSampleRate for production environment', () => {
      initErrorReporting({
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
      initErrorReporting({
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
      initErrorReporting({
        dsn: 'https://test@sentry.io/123',
      })

      const lastCall = mockInit.mock.calls[mockInit.mock.calls.length - 1]?.[0]
      if (name === 'Node.js')
        expect(lastCall?.ignoreErrors).toEqual(['Non-Error promise rejection'])
      else
        expect(lastCall?.ignoreErrors).toEqual(
          expect.arrayContaining(['Non-Error promise rejection']),
        )
    })
  })
})
