import { logger } from '@repo/utils/logger'
import type { ErrorEvent, EventHint } from '@sentry/node'
import * as Sentry from '@sentry/node'

/**
 * Options for initializing Sentry
 */
export interface InitSentryOptions {
  /** Sentry DSN (optional - if not provided, Sentry is disabled) */
  dsn?: string
  /** Environment name (e.g., 'production', 'staging', 'development') */
  environment?: string
  /** Release version */
  release?: string
  /** Optional custom beforeSend hook for domain-specific scrubbing */
  beforeSend?: (event: ErrorEvent, hint: EventHint) => ErrorEvent | null
}

/**
 * Initializes Sentry for error tracking
 * Uses @sentry/node for Node.js/Fastify applications
 * Uses Sentry's built-in PII scrubbing by default
 *
 * @param options - Sentry initialization options
 */
export function initSentry(options: InitSentryOptions): void {
  if (!options.dsn) {
    logger.warn('Sentry DSN not configured - error reporting disabled')
    return
  }

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? 'development',
    release: options.release,
    tracesSampleRate: options.environment === 'production' ? 0.1 : 1.0,
    // Optional: custom beforeSend for domain-specific scrubbing
    // Sentry's built-in scrubbing handles most cases automatically
    // Network-related errors (e.g., ECONNREFUSED, ETIMEDOUT) should be filtered via beforeSend
    beforeSend: options.beforeSend,
    ignoreErrors: ['Non-Error promise rejection'],
  })
}
