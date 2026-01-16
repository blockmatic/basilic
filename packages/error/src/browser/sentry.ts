import { logger } from '@repo/utils/logger'
import type { ErrorEvent, EventHint } from '@sentry/browser'
import * as Sentry from '@sentry/browser'

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
 * Uses @sentry/browser for browser applications (TanStack Start, Vue, Svelte, etc.)
 * Uses Sentry's built-in PII scrubbing by default
 *
 * @param options - Sentry initialization options
 */
export function initSentry(options: InitSentryOptions): void {
  if (!options.dsn) {
    logger.warn('Sentry DSN not configured - error reporting disabled')
    return
  }

  // Check if Sentry is already initialized to prevent double initialization
  if (Sentry.getClient()) {
    return
  }

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
