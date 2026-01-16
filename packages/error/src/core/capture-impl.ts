import { logger } from '@repo/utils/logger'
import { getError } from '../registry.js'
import type { CaptureErrorOptions, CatalogError } from '../types.js'
import { toErrorWithMessage } from '../utils.js'

// Module-scoped flag for warning suppression (shows once per app runtime)
let sentryWarningShown = false

/**
 * Minimal interface for Sentry modules - compatible with both @sentry/node and @sentry/nextjs
 */
interface SentryAdapter {
  getClient: () => object | null
  captureException: (
    exception: Error,
    hint?: {
      tags?: Record<string, string>
      level?: 'error' | 'warning' | 'info'
      contexts?: Record<string, Record<string, unknown>>
    },
  ) => void
}

/**
 * Creates a captureError function bound to a specific Sentry implementation
 * This factory allows sharing the capture logic between Node.js and Next.js
 *
 * @internal This is an internal implementation detail, not part of public API
 */
export function createCaptureError(Sentry: SentryAdapter) {
  return function captureError(options: CaptureErrorOptions): CatalogError {
    const errorWithMessage = toErrorWithMessage(options.error)
    const catalogError = getError(options.code)

    // Validate error code exists (runtime check)
    if (!catalogError) {
      const fallback: CatalogError = {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
      }
      const errorLogger = logger.child({ code: options.code, label: options.label })

      if (process.env.NODE_ENV === 'development') {
        errorLogger.error(
          `Unknown error code: "${options.code}". ` +
            `This error code is not defined in the error catalog. ` +
            `Ensure the error code exists in packages/error/src/catalogs/ and the package is rebuilt.`,
        )
      } else {
        errorLogger.warn(
          `Unknown error code: "${options.code}". Using fallback. ` +
            `The error code may not be defined in the error catalog.`,
        )
      }
      return fallback
    }

    // Log with structured logging (Pino on server, console wrapper on client)
    const errorLogger = logger.child({
      errorCode: options.code,
      label: options.label,
      ...options.tags,
    })

    errorLogger.error(
      {
        error: options.error,
        ...options.data,
      },
      `[${options.label}] ${options.code}: ${errorWithMessage.message}`,
    )

    // Capture to Sentry asynchronously (non-blocking)
    // Note: Uses Promise.resolve().then() for runtime compatibility across Node.js, Edge, and browsers.
    // Limitation: In serverless environments, errors may be dropped if function terminates before promise executes.
    // For critical paths, apps should call Sentry.flush() explicitly before function termination.
    Promise.resolve().then(() => {
      const sentryClient = Sentry.getClient()

      if (!sentryClient) {
        if (!sentryWarningShown) {
          logger.warn(
            'Sentry not initialized - error reporting disabled. Set SENTRY_DSN to enable.',
          )
          sentryWarningShown = true
        }
        return
      }

      // Capture REAL error in Sentry (async, non-blocking)
      // Sentry's built-in scrubbing handles PII automatically
      Sentry.captureException(
        options.error instanceof Error ? options.error : new Error(errorWithMessage.message),
        {
          tags: {
            errorCode: options.code,
            component: options.label,
            ...options.tags,
          },
          level: options.level ?? 'error',
          contexts: {
            error: {
              code: options.code,
              label: options.label,
              ...options.data,
            },
          },
        },
      )
    })

    // Return SAFE catalog error immediately (synchronous)
    return catalogError
  }
}
