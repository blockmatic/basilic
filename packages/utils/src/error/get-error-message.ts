import isPlainObject from 'lodash-es/isPlainObject'

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
  if (isPlainObject(error) && typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    if ('message' in obj && typeof obj.message === 'string') return obj.message
  }
  return String(error)
}
