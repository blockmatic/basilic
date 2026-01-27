/**
 * Error class for API request failures.
 *
 * Extends the standard Error class with HTTP status code and response body.
 * Thrown by API client methods when requests fail.
 *
 * @example
 * ```ts
 * try {
 *   await client.auth.magiclink.request({ body: { email } })
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`API error ${error.status}: ${error.message}`)
 *     console.error('Response body:', error.body)
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  /**
   * Creates a new ApiError instance.
   *
   * @param status - HTTP status code (e.g., 400, 401, 500)
   * @param message - Error message
   * @param body - Optional response body from the API
   */
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
