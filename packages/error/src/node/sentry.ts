import { logger } from '@repo/utils/logger/server'
import type { ErrorEvent, EventHint } from '@sentry/node'
import * as Sentry from '@sentry/node'

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
 * Initializes error reporting for Node.js/Fastify applications.
 * Uses a compatible SDK (GlitchTip, Sentry, etc.) - same DSN format.
 *
 * @param options - Error reporting initialization options
 */
export function initErrorReporting(options: InitErrorReportingOptions): void {
  if (!options.dsn) {
    logger.warn('Error reporting DSN not configured - error reporting disabled')
    return
  }

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? 'development',
    release: options.release,
    tracesSampleRate: options.environment === 'production' ? 0.1 : 1.0,
    beforeSend: options.beforeSend,
    ignoreErrors: ['Non-Error promise rejection'],
  })
}
