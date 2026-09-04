import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureError as captureErrorBrowser } from '../browser/capture.js'
import { captureError as captureErrorNextjs } from '../nextjs/capture.js'
import { captureError as captureErrorNextjsServer } from '../nextjs/capture.server.js'
import { captureError as captureErrorNode } from '../node/capture.js'

const { serverLogger, clientLogger } = vi.hoisted(() => ({
  serverLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
  clientLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@repo/utils/logger/server', () => ({
  logger: serverLogger,
}))
vi.mock('@repo/utils/logger/client', () => ({
  logger: clientLogger,
}))

const { mockCaptureException } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
}))

vi.mock('@sentry/node', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))
vi.mock('@sentry/nextjs', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))
vi.mock('@sentry/browser', () => ({ captureException: mockCaptureException, getClient: vi.fn() }))

const loggers = {
  server: serverLogger,
  client: clientLogger,
}

describe('capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe.each([
    ['Node.js', captureErrorNode, 'server'],
    ['Next.js client', captureErrorNextjs, 'client'],
    ['Next.js server', captureErrorNextjsServer, 'server'],
    ['Browser', captureErrorBrowser, 'client'],
  ] as const)('captureError (%s)', (_name, captureError, loggerKind) => {
    const expectedLogger = () => loggers[loggerKind]
    const otherLogger = () => loggers[loggerKind === 'server' ? 'client' : 'server']

    it('logs synchronously with err, label, and code', () => {
      const error = new Error('Real error')
      captureError({
        code: 'SERVER_ERROR',
        error,
        label: 'Test',
        tags: { app: 'test' },
      })

      expect(expectedLogger().error).toHaveBeenCalledTimes(1)
      expect(otherLogger().error).not.toHaveBeenCalled()
      const [payload, msg] = expectedLogger().error.mock.calls[0] as [
        Record<string, unknown>,
        string,
      ]
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
      expect(expectedLogger().warn).toHaveBeenCalled()
      expect(otherLogger().warn).not.toHaveBeenCalled()
      expect(expectedLogger().error).not.toHaveBeenCalled()
    })

    it('does not log when report is false', () => {
      captureError({
        error: new Error('Real error'),
        label: 'Test',
        report: false,
      })
      expect(expectedLogger().error).not.toHaveBeenCalled()
      expect(otherLogger().error).not.toHaveBeenCalled()
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
      expect(expectedLogger().error).not.toHaveBeenCalled()
      expect(otherLogger().error).not.toHaveBeenCalled()
    })
  })
})
