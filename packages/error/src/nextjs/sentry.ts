import { logger } from '@repo/utils/logger/client'
import type { ErrorEvent, EventHint } from '@sentry/nextjs'
import * as Sentry from '@sentry/nextjs'

/**
 * Options for initializing error reporting
 */
export interface InitErrorReportingOptions {
  /** DSN for error reporting backend (optional - if not provided, errors are logged only) */
  dsn?: string
  /** Environment name (e.g., 'production', 'staging', 'development') */
  environment?: string
  /** Release version */
  release?: string
  /** Optional custom beforeSend hook for domain-specific scrubbing */
  beforeSend?: (event: ErrorEvent, hint: EventHint) => ErrorEvent | null
}

/**
 * Initializes error reporting for Next.js applications.
 * Uses a compatible SDK (GlitchTip, Sentry, etc.) - same DSN format.
 * Do NOT call from instrumentation.ts - use dedicated config files instead (see package README).
 *
 * @param options - Error reporting initialization options
 */
export function initErrorReporting(options: InitErrorReportingOptions): void {
  if (!options.dsn) {
    logger.warn('Error reporting DSN not configured - error reporting disabled')
    return
  }

  if (Sentry.getClient()) return

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? 'development',
    release: options.release,
    tracesSampleRate: options.environment === 'production' ? 0.1 : 1.0,
    beforeSend: options.beforeSend,
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'NetworkError',
      'Failed to fetch',
    ],
  })
}
