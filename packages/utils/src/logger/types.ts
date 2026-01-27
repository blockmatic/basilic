/**
 * Logging levels supported by the logger.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * Logger interface for structured logging.
 *
 * Provides methods for different log levels and child logger creation
 * for contextual logging. Compatible with both browser (console) and
 * server (Pino) implementations.
 *
 * @example
 * ```ts
 * logger.info({ userId: '123' }, 'User logged in')
 * logger.error({ err: error }, 'Failed to process request')
 *
 * const childLogger = logger.child({ requestId: 'abc' })
 * childLogger.debug('Processing request')
 * ```
 */
export interface Logger {
  /** Log debug message (lowest priority) */
  debug: (data?: unknown, msg?: string) => void

  /** Log info message */
  info: (data?: unknown, msg?: string) => void

  /** Log warning message */
  warn: (data?: unknown, msg?: string) => void

  /** Log error message (highest priority) */
  error: (data?: unknown, msg?: string) => void

  /**
   * Create a child logger with additional bindings.
   * All logs from the child logger will include the bindings.
   *
   * @param bindings - Key-value pairs to include in all logs
   * @returns New logger instance with merged bindings
   */
  child: (bindings: Record<string, unknown>) => Logger
}

/**
 * Parses a boolean value from an environment variable string.
 *
 * Accepts '1', 'true', 'yes', 'on' (case-insensitive) as truthy values.
 * Returns the fallback value if the input is null or undefined.
 *
 * @param v - Environment variable value (string or undefined)
 * @param fallback - Default value if v is null/undefined
 * @returns Parsed boolean value
 */
export const parseBool = (v: string | undefined, fallback: boolean): boolean => {
  if (v == null) return fallback
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())
}

/**
 * Normalizes a log level string to a valid LogLevel.
 *
 * Converts the input to lowercase and validates against known log levels.
 * Returns 'info' as the default if the input is not a valid log level.
 *
 * @param v - Log level string (case-insensitive)
 * @returns Normalized log level, defaults to 'info' if invalid
 */
export const normalizeLevel = (v: string | undefined): LogLevel => {
  const x = (v ?? '').toLowerCase()
  if (x === 'debug' || x === 'info' || x === 'warn' || x === 'error' || x === 'silent') return x
  return 'info'
}
