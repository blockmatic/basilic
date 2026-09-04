import type { Logger } from '@repo/utils/logger/types'

/**
 * Options for capturing an error to the reporting backend.
 *
 * Provides a developer-friendly abstraction with automatic error conversion,
 * consistent labeling, and optional logging integration.
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
   * Real error object (sent to reporting backend with full stack trace).
   * Accepts any error type (Error, string, object, etc.) - automatically converted to Error.
   */
  error: unknown

  /**
   * Component/feature label for error reporting.
   * Maps to tags and context for filtering and grouping.
   */
  label: string

  /**
   * Optional error code (used as tag for filtering).
   */
  code?: string

  /**
   * Additional tags for filtering in the reporting backend.
   */
  tags?: Record<string, string>

  /**
   * Additional context (sent to reporting backend only, not exposed to users).
   */
  data?: Record<string, unknown>

  /**
   * Error level for reporting.
   * @default 'error'
   */
  level?: 'error' | 'warning' | 'info'

  /**
   * When false, emit nothing (do not log). Default true.
   */
  report?: boolean

  /**
   * Optional logger. Fastify request handlers should pass `request.log`.
   */
  logger?: Logger
}
