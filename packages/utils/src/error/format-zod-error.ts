import type { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

/**
 * Formats a zod error into a user-friendly error message.
 * Uses zod-validation-error for better error formatting.
 *
 * @param params - Error formatting parameters
 * @param params.error - ZodError to format
 * @param params.defaultMessage - Default message if error cannot be formatted
 * @returns Formatted error message
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data)
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     const message = formatZodError({ error })
 *     console.error(message)
 *   }
 * }
 * ```
 */
export function formatZodError({
  error,
  defaultMessage = 'Validation failed',
}: {
  error: ZodError
  defaultMessage?: string
}): string {
  try {
    const validationError = fromZodError(error)
    return validationError.message
  } catch {
    return defaultMessage
  }
}
