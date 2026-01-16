import type { ErrorWithMessage } from './types.js'

/**
 * Type guard to check if error has a message property
 * Based on Kent C. Dodds pattern for type-safe error handling
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
 * Converts unknown error to ErrorWithMessage
 * Handles all possible thrown values (Error, string, object, etc.)
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
 * Extracts error message from unknown error type
 * Type-safe error message extraction following Kent C. Dodds pattern
 */
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}
