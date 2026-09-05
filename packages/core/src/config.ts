/**
 * Configuration options for creating an API client.
 *
 * Three auth modes:
 * - **apiKey**: Static Bearer token (e.g. bask_xxx_secret). No callbacks. Never refresh.
 * - **JWT**: getAuthToken, getRefreshToken, onTokensRefreshed required. Refresh on 401.
 * - **No auth**: baseUrl only. No Authorization header.
 *
 * @example API key mode
 * ```ts
 * createClient({ baseUrl: 'https://api.example.com', apiKey: 'bask_xxx_secret' })
 * ```
 *
 * @example JWT mode
 * ```ts
 * createClient({
 *   baseUrl: 'https://api.example.com',
 *   getAuthToken: async () => localStorage.getItem('accessToken'),
 *   getRefreshToken: async () => localStorage.getItem('refreshToken'),
 *   onTokensRefreshed: async ({ token, refreshToken }) => {
 *     localStorage.setItem('accessToken', token)
 *     localStorage.setItem('refreshToken', refreshToken)
 *   },
 * })
 * ```
 *
 * @example No-auth mode
 * ```ts
 * createClient({ baseUrl: 'https://api.example.com' })
 * ```
 */
export type ApiKeyOptions = {
  baseUrl: string
  apiKey: string
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}

export type JwtOptions = {
  baseUrl: string
  getAuthToken: () => string | null | Promise<string | null>
  getRefreshToken: () => string | null | Promise<string | null>
  onTokensRefreshed: (tokens: { token: string; refreshToken: string }) => void | Promise<void>
  /** Override Fastify `POST /auth/session/refresh`. Next web uses same-origin `/api/auth/refresh`. */
  refreshTokens?: () => Promise<{ token: string; refreshToken: string } | null>
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}

export type NoAuthOptions = {
  baseUrl: string
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}

export type CoreClientOptions = ApiKeyOptions | JwtOptions | NoAuthOptions
