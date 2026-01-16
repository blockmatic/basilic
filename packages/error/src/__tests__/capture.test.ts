import { logger } from '@repo/utils/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureError as captureErrorBrowser } from '../browser/capture.js'
import { captureError as captureErrorNextjs } from '../nextjs/capture.js'
import { captureError as captureErrorNode } from '../node/capture.js'

// Mock logger
vi.mock('@repo/utils/logger', () => ({
  logger: {
    child: vi.fn(() => ({
      error: vi.fn(),
      warn: vi.fn(),
    })),
    warn: vi.fn(),
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
    it('should return catalog error for code in catalog', () => {
      const result = captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(result).toEqual({
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred',
      })
    })

    it('should return catalog error for API-specific code', () => {
      const result = captureError({
        code: 'AI_MODEL_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(result).toEqual({
        code: 'AI_MODEL_ERROR',
        message: 'AI model error occurred',
      })
    })

    it('should return catalog error for web-specific code', () => {
      const result = captureError({
        code: 'DASHBOARD_DATA_LOAD_FAILED',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(result).toEqual({
        code: 'DASHBOARD_DATA_LOAD_FAILED',
        message: 'Failed to load dashboard data',
      })
    })

    it('should return fallback for code not in catalog', () => {
      const result = captureError({
        code: 'UNREGISTERED_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(result).toEqual({
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
      })
    })

    it('should log error via logger', () => {
      captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test Label',
        tags: { app: 'test' },
        data: { extra: 'data' },
      })

      expect(logger.child).toHaveBeenCalledWith({
        errorCode: 'SERVER_ERROR',
        label: 'Test Label',
        app: 'test',
      })
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

    it('should handle non-Error objects', async () => {
      captureError({
        code: 'SERVER_ERROR',
        error: 'String error',
        label: 'Test',
        tags: { app: 'test' },
      })

      await new Promise(resolve => setImmediate(resolve))

      expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
    })

    it('should handle Sentry not initialized gracefully', async () => {
      mockGetClient.mockReturnValue(null)

      const result = captureError({
        code: 'SERVER_ERROR',
        error: new Error('Real error'),
        label: 'Test',
        tags: { app: 'test' },
      })

      await new Promise(resolve => setImmediate(resolve))

      // Should still return catalog error
      expect(result).toEqual({
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred',
      })

      // Should not throw
      expect(mockCaptureException).not.toHaveBeenCalled()
    })
  })
})
