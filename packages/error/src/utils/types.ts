/**
 * Error interface with a message property.
 *
 * Follows the Kent C. Dodds pattern for type-safe error message extraction.
 * Used to represent any error-like object that has a message property,
 * enabling safe error handling without type assertions.
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
export interface ErrorWithMessage {
  /** Error message string */
  message: string
}

/**
 * Success variant of Result type.
 * Contains the successful data value, error is undefined.
 */
type Success<T> = { data: T; error: undefined }

/**
 * Failure variant of Result type.
 * Contains the error value, data is undefined.
 */
type Failure<E> = { data: undefined; error: E }

/**
 * Result type representing either success or failure.
 * Follows the Result/Either pattern for type-safe error handling.
 * Both `data` and `error` properties exist for destructuring convenience,
 * but only one will be defined at a time.
 *
 * @template T - The type of the success data
 * @template E - The type of the error, must extend ErrorWithMessage (defaults to ErrorWithMessage)
 *
 * @example
 * ```ts
 * interface ApiError extends ErrorWithMessage {
 *   code: number
 * }
 * const { error, data } = await tryCatch(fetchUser(id))
 * if (error) {
 *   // Handle error - error.message is always available
 * } else {
 *   // Use data - TypeScript knows data is defined here
 * }
 * ```
 */
export type Result<T, E extends ErrorWithMessage = ErrorWithMessage> = Success<T> | Failure<E>
