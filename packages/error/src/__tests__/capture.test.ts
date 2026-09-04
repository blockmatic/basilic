import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureError as captureErrorBrowser } from '../browser/capture.js'
import { captureError as captureErrorNextjs } from '../nextjs/capture.js'
import { captureError as captureErrorNextjsServer } from '../nextjs/capture.server.js'
import { captureError as captureErrorNode } from '../node/capture.js'

const { mockLoggerError, mockLoggerWarn, mockLoggerInfo } = vi.hoisted(() => ({
  mockLoggerError: vi.fn(),
  mockLoggerWarn: vi.fn(),
  mockLoggerInfo: vi.fn(),
}))

vi.mock('@repo/utils/logger/server', () => ({
  logger: {
    error: mockLoggerError,
    warn: mockLoggerWarn,
    info: mockLoggerInfo,
  },
}))
vi.mock('@repo/utils/logger/client', () => ({
  logger: {
    error: mockLoggerError,
    warn: mockLoggerWarn,
    info: mockLoggerInfo,
  },
}))

const { mockCaptureException } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
}))

vi.mock('@sentry/node', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))
vi.mock('@sentry/browser', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))

describe('capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe.each([
    ['Node.js', captureErrorNode],
    ['Next.js client', captureErrorNextjs],
    ['Next.js server', captureErrorNextjsServer],
    ['Browser', captureErrorBrowser],
  ])('captureError (%s)', (_name, captureError) => {
    it('logs synchronously with err, label, and code', () => {
      const error = new Error('Real error')
      captureError({
        code: 'SERVER_ERROR',
        error,
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(mockLoggerError).toHaveBeenCalledTimes(1)
      const [payload, msg] = mockLoggerError.mock.calls[0] as [Record<string, unknown>, string]
      expect(msg).toBe('Test')
      expect(payload.code).toBe('SERVER_ERROR')
      expect(payload.label).toBe('Test')
      expect(payload.app).toBe('test')
      expect(payload.err).toMatchObject({ type: 'Error', message: 'Real error' })
      expect(mockCaptureException).not.toHaveBeenCalled()
    })

    it('maps warning level to logger.warn', () => {
      captureError({
        error: new Error('Real error'),
        label: 'Test',
        level: 'warning',
      })
      expect(mockLoggerWarn).toHaveBeenCalled()
      expect(mockLoggerError).not.toHaveBeenCalled()
    })

    it('does not log when report is false', () => {
      captureError({
        error: new Error('Real error'),
        label: 'Test',
        report: false,
      })
      expect(mockLoggerError).not.toHaveBeenCalled()
      expect(mockCaptureException).not.toHaveBeenCalled()
    })

    it('uses a supplied logger', () => {
      const customLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        child: vi.fn(),
      }
      captureError({
        error: new Error('Real error'),
        label: 'Test',
        logger: customLogger,
      })
      expect(customLogger.error).toHaveBeenCalled()
      expect(mockLoggerError).not.toHaveBeenCalled()
    })
  })
})
