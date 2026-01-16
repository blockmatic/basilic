import type { Logger } from '@repo/utils/logger'
import type { AllErrorCode } from './catalogs/merge.js'

/**
 * Catalog error structure - safe error returned to users
 */
export interface CatalogError {
  code: string
  message: string
}

/**
 * Error with message property (Kent C. Dodds pattern)
 * Used for type-safe error message extraction
 */
export interface ErrorWithMessage {
  message: string
}

/**
 * All error codes from the merged error catalogs
 * This includes server, client, common, API, and web error codes
 * Used for type-safe error handling
 */
export type CoreErrorCode = AllErrorCode

/**
 * Options for capturing an error
 */
export interface CaptureErrorOptions {
  /** Error code (must exist in catalog). Core codes get autocomplete, but string is accepted for flexibility. */
  code: CoreErrorCode | string
  /** Real error object (sent to Sentry with full stack trace) */
  error: unknown
  /** Component/feature label for Sentry */
  label: string
  /** Optional logger instance (defaults to internal logger). Use Fastify's request.log for native logging. */
  logger?: Logger
  /** Additional context (sent to Sentry only, not exposed to users) */
  data?: Record<string, unknown>
  /** Tags for filtering in Sentry */
  tags?: {
    /** Application name: 'api' | 'web' | 'mobile' | 'docs' (required). Known apps get autocomplete, but string is accepted for custom apps. */
    app: 'api' | 'web' | 'mobile' | 'docs' | string
    /** Package name: '@repo/auth' | '@repo/db' (optional) */
    package?: string
    /** Module name: 'user-service' | 'payment-handler' (optional) */
    module?: string
    /** Additional custom tags */
    [key: string]: string | undefined
  }
  /** Error level for Sentry */
  level?: 'error' | 'warning' | 'info'
}
