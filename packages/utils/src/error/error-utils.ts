import type { ErrorWithMessage } from './types'

/**
 * Type guard to check if an unknown error has a message property
 * @param error - The error to check
 * @returns True if error is an object with a string message property
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
 * Converts any error-like value into an Error object with a message
 * @param maybeError - The value to convert to an error
 * @returns An Error object with a message property
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    // Try to stringify the error object
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}
