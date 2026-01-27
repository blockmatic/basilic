import type { ErrorWithMessage } from './types.js'

/**
 * Type guard to check if an error has a message property.
 *
 * Based on Kent C. Dodds pattern for type-safe error handling. Safely checks
 * if an unknown value is an error-like object with a string message property.
 *
 * @param error - Unknown error value to check
 * @returns True if error has a message property, false otherwise
 *
 * @example
 * ```ts
 * function handleError(error: unknown) {
 *   if (isErrorWithMessage(error)) {
 *     console.error(error.message) // Type-safe access
 *   }
 * }
 * ```
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

/**
 * Converts an unknown error to an ErrorWithMessage.
 *
 * Handles all possible thrown values (Error, string, object, etc.) and safely
 * converts them to an ErrorWithMessage interface. Always returns a valid object
 * with a message property, even if conversion fails.
 *
 * @param maybeError - Unknown error value to convert
 * @returns ErrorWithMessage object with a message property
 *
 * @example
 * ```ts
 * try {
 *   throw 'String error'
 * } catch (error) {
 *   const errorWithMessage = toErrorWithMessage(error)
 *   console.error(errorWithMessage.message) // 'String error'
 * }
 * ```
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) {
    return maybeError
  }

  try {
    return new Error(String(maybeError))
  } catch {
    // Fallback if String() throws (shouldn't happen, but be safe)
    return { message: 'An unknown error occurred' }
  }
}

/**
 * Extracts an error message from an unknown error type.
 *
 * Type-safe error message extraction following Kent C. Dodds pattern.
 * Safely converts any error value to a string message, handling all possible
 * thrown values (Error, string, object, etc.).
 *
 * @param error - Unknown error value
 * @returns Error message string
 *
 * @example
 * ```ts
 * try {
 *   // Some operation
 * } catch (error) {
 *   const message = getErrorMessage(error) // Always returns a string
 *   console.error(message)
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}
