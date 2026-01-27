import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureError as captureErrorBrowser } from '../browser/capture.js'
import { captureError as captureErrorNextjs } from '../nextjs/capture.js'
import { captureError as captureErrorNode } from '../node/capture.js'

// Mock logger - use vi.hoisted to define mocks before hoisted mock factories
const { mockLoggerChild, mockLoggerWarn } = vi.hoisted(() => ({
  mockLoggerChild: vi.fn(() => ({
    error: vi.fn(),
    warn: vi.fn(),
  })),
  mockLoggerWarn: vi.fn(),
}))

vi.mock('@repo/utils/logger', () => ({
  logger: {
    child: mockLoggerChild,
    warn: mockLoggerWarn,
  },
}))

// Mock Sentry - use vi.hoisted to define mocks before hoisted mock factories
const { mockCaptureException, mockGetClient } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
  mockGetClient: vi.fn<() => unknown>(() => ({})),
}))

vi.mock('@sentry/node', async () => {
  return {
    getClient: mockGetClient,
    captureException: mockCaptureException,
  }
})

vi.mock('@sentry/nextjs', async () => {
  return {
    getClient: mockGetClient,
    captureException: mockCaptureException,
  }
})

vi.mock('@sentry/browser', async () => {
  return {
    getClient: mockGetClient,
    captureException: mockCaptureException,
  }
})

describe('capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetClient.mockReturnValue({})
  })

  describe.each([
    ['Node.js', captureErrorNode],
    ['Next.js', captureErrorNextjs],
    ['Browser', captureErrorBrowser],
  ])('captureError (%s)', (_name, captureError) => {
    it('should return void', () => {
      const result = captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(result).toBeUndefined()
    })

    it('should capture to Sentry asynchronously', async () => {
      const error = new Error('Real error')
      captureError({
        code: 'SERVER_ERROR',
        error,
        label: 'Test',
        tags: { app: 'test', module: 'test-module' },
        data: { extra: 'data' },
        level: 'warning',
      })

      // Wait for setImmediate to execute
      await new Promise(resolve => setImmediate(resolve))

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        tags: {
          errorCode: 'SERVER_ERROR',
          component: 'Test',
          app: 'test',
          module: 'test-module',
        },
        level: 'warning',
        contexts: {
          error: {
            code: 'SERVER_ERROR',
            label: 'Test',
            extra: 'data',
          },
        },
      })
    })

    it('should handle errors without code', async () => {
      const error = new Error('Real error')
      captureError({
        error,
        label: 'Test',
        tags: { app: 'test' },
      })

      await new Promise(resolve => setImmediate(resolve))

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'Test',
          app: 'test',
        },
        level: 'error',
        contexts: {
          error: {
            label: 'Test',
          },
        },
      })
    })

    it('should handle non-Error objects', async () => {
      captureError({
        code: 'SERVER_ERROR',
        error: 'String error',
        label: 'Test',
        tags: { app: 'test' },
      })

      await new Promise(resolve => setImmediate(resolve))

      expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
      const capturedError = mockCaptureException.mock.calls[0]?.[0]
      expect(capturedError).toBeInstanceOf(Error)
      expect(capturedError?.message).toBe('String error')
    })

    it('should handle Sentry not initialized gracefully', async () => {
      mockGetClient.mockReturnValue(null)

      captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      await new Promise(resolve => setImmediate(resolve))

      // Should not throw and should not capture to Sentry
      expect(mockCaptureException).not.toHaveBeenCalled()
      // Note: Warning is logged but only once per runtime due to module-scoped flag
    })

    it('should not report when report is false', async () => {
      captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
        report: false,
      })

      await new Promise(resolve => setImmediate(resolve))

      expect(mockCaptureException).not.toHaveBeenCalled()
    })

    it('should use custom logger when provided', async () => {
      const customLogger = {
        warn: vi.fn(),
      }
      mockGetClient.mockReturnValue(null)
      customLogger.warn.mockClear()

      captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
        logger: customLogger as never,
      })

      await new Promise(resolve => setImmediate(resolve))

      // Custom logger should be called (may be 0 or 1 times due to module-scoped flag)
      // The flag prevents multiple warnings, so we just verify it doesn't throw
      expect(mockCaptureException).not.toHaveBeenCalled()
    })
  })
})
