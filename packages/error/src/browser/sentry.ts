import { logger } from '@repo/utils/logger/client'
import type { ErrorEvent, EventHint } from '@sentry/browser'
import * as Sentry from '@sentry/browser'

/**
 * Options for initializing error reporting
 */
export interface InitErrorReportingOptions {
  /** DSN (optional - if not provided, error reporting is disabled) */
  dsn?: string
  /** Environment name (e.g., 'production', 'staging', 'development') */
  environment?: string
  /** Release version */
  release?: string
  /** Optional custom beforeSend hook for domain-specific scrubbing */
  beforeSend?: (event: ErrorEvent, hint: EventHint) => ErrorEvent | null
}

/**
 * Initializes error reporting for browser applications
 * Uses @sentry/browser internally (GlitchTip and Sentry use same DSN format)
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
    // Optional: custom beforeSend for domain-specific scrubbing
    // Sentry's built-in scrubbing handles most cases automatically
    beforeSend: options.beforeSend,
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'NetworkError',
      'Failed to fetch',
    ],
  })
}
