/**
 * Sanitizes error messages by removing sensitive information in production.
 *
 * @param params - Sanitization parameters
 * @param params.message - Error message to sanitize
 * @param params.isProduction - Whether running in production mode
 * @returns Sanitized error message
 *
 * @example
 * ```ts
 * const safeMessage = sanitizeErrorMessage({
 *   message: 'Database connection failed: DATABASE_URL=xxx',
 *   isProduction: true
 * })
 * // Returns: 'Configuration error' in production
 * ```
 */
export function sanitizeErrorMessage({
  message,
  isProduction,
}: {
  message: string
  isProduction: boolean
}): string {
  if (!isProduction) return message

  const sensitivePatterns = [
    /ENCRYPTION_KEY/,
    /DYNAMIC_API_TOKEN/,
    /DATABASE_URL/,
    /SENTRY_DSN/,
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
  ]

  if (sensitivePatterns.some(pattern => pattern.test(message))) return 'Configuration error'

  return message
}
