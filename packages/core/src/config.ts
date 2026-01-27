/**
 * Configuration options for creating an API client.
 *
 * @example
 * ```ts
 * const client = createClient({
 *   baseUrl: 'https://api.example.com',
 *   getAuthToken: async () => localStorage.getItem('accessToken'),
 *   getRefreshToken: async () => localStorage.getItem('refreshToken'),
 *   onTokensRefreshed: async ({ token, refreshToken }) => {
 *     localStorage.setItem('accessToken', token)
 *     localStorage.setItem('refreshToken', refreshToken)
 *   },
 * })
 * ```
 */
export type CoreClientOptions = {
  /** Base URL for all API requests */
  baseUrl: string

  /**
   * Callback to get the authentication token.
   * Should return the raw JWT token (without "Bearer " prefix).
   * The client automatically adds `Bearer ` prefix when sending requests.
   */
  getAuthToken?: () => string | null | Promise<string | null>

  /**
   * Callback to get the refresh token.
   * Required for automatic token refresh on 401 errors.
   * If not provided, 401 errors fail normally (user must re-login).
   */
  getRefreshToken?: () => string | null | Promise<string | null>

  /**
   * Callback invoked when tokens are refreshed.
   * Required for automatic token refresh on 401 errors.
   * Should update token storage with the new tokens.
   */
  onTokensRefreshed?: (tokens: { token: string; refreshToken: string }) => void | Promise<void>

  /**
   * Callback to get custom headers for all requests.
   * Headers are merged with the Authorization header (if token exists).
   */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}
