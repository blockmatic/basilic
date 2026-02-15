// Error normalization: use @repo/utils/error only (no local duplication)
import { toErrorWithMessage } from '@repo/utils/error'
import type { Logger } from '@repo/utils/logger/server'
import type { CaptureErrorOptions } from '../types.js'

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
export function createCaptureError(Sentry: SentryAdapter, defaultLogger: Logger) {
  return function captureError(options: CaptureErrorOptions): void {
    const errorWithMessage = toErrorWithMessage(options.error)

    // Don't report if explicitly disabled
    if (options.report !== false) {
      // Capture to Sentry asynchronously (non-blocking)
      // Note: Uses Promise.resolve().then() for runtime compatibility across Node.js, Edge, and browsers.
      // Limitation: In serverless environments, errors may be dropped if function terminates before promise executes.
      // For critical paths, apps should call Sentry.flush() explicitly before function termination.
      Promise.resolve().then(() => {
        const sentryClient = Sentry.getClient()

        if (!sentryClient) {
          if (!sentryWarningShown) {
            const log = options.logger ?? defaultLogger
            log.warn('Sentry not initialized - error reporting disabled. Set SENTRY_DSN to enable.')
            sentryWarningShown = true
          }
          return
        }

        // Build tags object
        const tags: Record<string, string> = {
          component: options.label,
          ...(options.code ? { errorCode: options.code } : {}),
          ...options.tags,
        }

        // Capture REAL error in Sentry (async, non-blocking)
        // Sentry's built-in scrubbing handles PII automatically
        Sentry.captureException(
          options.error instanceof Error ? options.error : new Error(errorWithMessage.message),
          {
            tags,
            level: options.level ?? 'error',
            contexts: {
              error: {
                label: options.label,
                ...(options.code ? { code: options.code } : {}),
                ...options.data,
              },
            },
          },
        )
      })
    }
  }
}
