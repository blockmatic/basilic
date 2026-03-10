import type { Logger } from '@repo/utils/logger/server'
import type { CaptureErrorOptions } from '../types.js'
import { toErrorWithMessage } from '../utils/index.js'

// Module-scoped flag for warning suppression (shows once per app runtime)
let reportingWarningShown = false

/**
 * Minimal interface for reporting backend - compatible with @sentry/node and @sentry/nextjs
 */
interface ReportingAdapter {
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
 * Creates a captureError function bound to a specific reporting backend
 *
 * @internal This is an internal implementation detail, not part of public API
 */
export function createCaptureError(reporting: ReportingAdapter, defaultLogger: Logger) {
  return function captureError(options: CaptureErrorOptions): void {
    const errorWithMessage = toErrorWithMessage(options.error)

    if (options.report === false) return

    Promise.resolve()
      .then(() => {
        const reportingClient = reporting.getClient()

        if (!reportingClient) {
          if (!reportingWarningShown) {
            const log = options.logger ?? defaultLogger
            log.warn(
              'Error reporting not initialized - errors will be logged only. Set SENTRY_DSN to enable.',
            )
            reportingWarningShown = true
          }
          const log = options.logger ?? defaultLogger
          log.error(
            {
              err: errorWithMessage,
              label: options.label,
              code: options.code,
              ...options.data,
            },
            'Error captured (no DSN)',
          )
          return
        }

        const tags: Record<string, string> = {
          component: options.label,
          ...(options.code ? { errorCode: options.code } : {}),
          ...options.tags,
        }

        reporting.captureException(
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
      .catch(err => {
        const log = options.logger ?? defaultLogger
        try {
          log.error(
            { err, label: options.label, code: options.code, ...options.data },
            'Error reporting failed (captureException threw)',
          )
        } catch (logErr) {
          // biome-ignore lint/suspicious/noConsole: last-resort fallback when logger throws
          console.error(
            'Error reporting failed (logger threw):',
            { label: options.label, code: options.code, ...options.data },
            err,
            logErr,
          )
        }
      })
  }
}
