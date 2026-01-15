import { ZodError } from 'zod'

/**
 * Type guard to check if an error is a ZodError.
 *
 * @param error - Error to check
 * @returns True if error is a ZodError
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data)
 * } catch (error) {
 *   if (isZodError(error)) {
 *     // Handle zod validation error
 *   }
 * }
 * ```
 */
export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}
