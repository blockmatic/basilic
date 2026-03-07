import type { ErrorWithMessage, Result } from './types.js'

/**
 * Wraps a promise or async function in a try-catch and returns a Result type.
 * Returns `{ data: T, error?: undefined }` on success or `{ data?: undefined, error: E }` on failure.
 * Errors are normalized to ErrorWithMessage for consistent error handling.
 * Both `data` and `error` properties exist for destructuring convenience.
 *
 * @param promiseOrFn - The promise to wrap or async function to call
 * @returns A Result object with both `data` and `error` properties (one is always undefined)
 *
 * @example
 * ```ts
 * // With promise - destructuring works
 * const { error, data } = await tryCatch(fetchUser(id))
 * if (error) return console.error(error.message)
 * console.log(data) // TypeScript knows data is defined here
 *
 * // With async function (lazy evaluation)
 * const { error } = await tryCatch(async () => {
 *   await initializeOptionalFeature()
 * })
 * if (error) logger.error(error.message)
 * ```
 */
export async function tryCatch<T = void, E extends ErrorWithMessage = ErrorWithMessage>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
): Promise<Result<T, E>> {
  try {
    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn
    return { data: await promise, error: undefined }
  } catch (e: unknown) {
    return { data: undefined, error: toErrorWithMessage(e) as E }
  }
}

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
  if (isErrorWithMessage(maybeError)) return maybeError

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

// Re-export types
export type { ErrorWithMessage, Result } from './types.js'
