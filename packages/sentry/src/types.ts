import type { Logger } from '@repo/utils/logger/server'

/**
 * Options for capturing an error to Sentry.
 *
 * Provides a developer-friendly abstraction over Sentry's native `captureException` API
 * with automatic error conversion, consistent labeling, and optional logging integration.
 *
 * @example
 * ```ts
 * captureError({
 *   code: 'NETWORK_ERROR',
 *   error: new Error('Failed to fetch'),
 *   label: 'API Call',
 *   data: { endpoint: '/api/data' },
 *   tags: { app: 'web' },
 * })
 * ```
 */
export interface CaptureErrorOptions {
  /**
   * Real error object (sent to Sentry with full stack trace).
   * Accepts any error type (Error, string, object, etc.) - automatically converted to Error.
   */
  error: unknown

  /**
   * Component/feature label for Sentry.
   * Automatically maps to both `tags.component` and `contexts.error.label` in Sentry.
   */
  label: string

  /**
   * Optional error code (used as tag only, for filtering in Sentry).
   * Automatically maps to both `tags.errorCode` and `contexts.error.code` in Sentry.
   */
  code?: string

  /**
   * Tags for filtering in Sentry.
   * Additional tags beyond the automatic `component` and `errorCode` tags.
   */
  tags?: Record<string, string>

  /**
   * Additional context (sent to Sentry only, not exposed to users).
   * Automatically merged into `contexts.error` for convenience.
   */
  data?: Record<string, unknown>

  /**
   * Error level for Sentry.
   * @default 'error'
   */
  level?: 'error' | 'warning' | 'info'

  /**
   * Whether to report to Sentry.
   * Allows disabling Sentry reporting entirely without conditional logic.
   * @default true
   */
  report?: boolean

  /**
   * Optional logger instance (for non-Fastify contexts only, Fastify handles logging).
   * Only used for warnings when Sentry is not initialized (e.g., missing DSN).
   * If omitted, defaults to `@repo/utils/logger`. In Fastify, pass `request.log` for request context.
   */
  logger?: Logger
}
