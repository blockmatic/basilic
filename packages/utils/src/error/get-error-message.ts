/**
 * Extracts error message from various error types.
 * Handles Error, objects with message property, and unknown types.
 *
 * @param error - Error to extract message from
 * @returns Error message string or null if no error
 *
 * @example
 * ```ts
 * const message = getErrorMessage(new Error('Something went wrong'))
 * // Returns: 'Something went wrong'
 * ```
 */
export function getErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    error.constructor === Object &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as Record<string, unknown>).message as string
  }
  return String(error)
}
