import { api } from './api-wrapper.gen'
import type { CoreClientOptions } from './config'
import { ApiError } from './errors'
import { createConfig, createClient as createHeyApiClient } from './gen/client/index'
import * as gen from './gen/index'

// Lock to prevent multiple concurrent refresh attempts
let refreshLock: Promise<{ token: string; refreshToken: string } | null> | null = null

function wrapApiWithClient<T>(
  obj: T,
  client: ReturnType<typeof createHeyApiClient>,
  options: CoreClientOptions,
): T {
  if (typeof obj === 'function') {
    return (async (callOptions: Record<string, unknown> = {}) => {
      // Call underlying function with client
      const response = await obj({
        ...callOptions,
        client,
      })

      // Check for errors
      const errorStatus =
        response.error && 'status' in response.error
          ? (response.error as { status: number }).status
          : (response.response?.status ?? 500)
      const errorMessage = (response.error as { message?: string })?.message ?? 'Unknown error'

      // Handle 401 with refresh token
      // Skip refresh for refresh endpoint itself to avoid circular refresh
      const isRefreshEndpoint = response.request?.url?.includes('/auth/session/refresh') ?? false

      if (
        errorStatus === 401 &&
        response.error &&
        options.getRefreshToken &&
        options.onTokensRefreshed &&
        !isRefreshEndpoint
      ) {
        try {
          // Use lock to prevent multiple concurrent refresh calls
          if (!refreshLock) {
            refreshLock = (async () => {
              const refreshToken = await options.getRefreshToken?.()
              if (!refreshToken) {
                return null
              }

              const refreshResponse = await gen.refresh({
                client,
                body: { refreshToken },
              })

              if (refreshResponse.error || !refreshResponse.data) {
                return null
              }

              await options.onTokensRefreshed?.(refreshResponse.data)
              return refreshResponse.data
            })()
          }

          const newTokens = await refreshLock
          refreshLock = null

          if (newTokens) {
            // Retry original request with new token
            const retryResponse = await obj({
              ...callOptions,
              client,
            })

            if (retryResponse.error) {
              const retryErrorStatus =
                retryResponse.error && 'status' in retryResponse.error
                  ? (retryResponse.error as { status: number }).status
                  : (retryResponse.response?.status ?? 500)
              const retryErrorMessage =
                (retryResponse.error as { message?: string })?.message ?? 'Unknown error'
              throw new ApiError(retryErrorStatus, retryErrorMessage, retryResponse.error)
            }

            return retryResponse.data
          }
        } catch (_refreshError) {
          refreshLock = null
          // Refresh failed, throw original 401 error
        }
      }

      // Throw error if response has error
      if (response.error) {
        throw new ApiError(errorStatus, errorMessage, response.error)
      }

      return response.data
    }) as T
  }

  if (obj && typeof obj === 'object') {
    const wrapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      wrapped[key] = wrapApiWithClient(value, client, options)
    }
    return wrapped as T
  }

  return obj
}

/**
 * Creates a type-safe API client with nested namespace API and automatic token refresh.
 *
 * The client provides a nested namespace API (e.g., `client.auth.magiclink.request()`)
 * and automatically handles authentication token injection and refresh on 401 errors.
 *
 * @param options - Client configuration options
 * @returns API client with nested namespace structure matching the OpenAPI spec
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
 *
 * // Nested namespace API
 * await client.auth.magiclink.request({ body: { email, callbackUrl } })
 * await client.auth.session.logout()
 * await client.ai.chat({ body: { messages: [...] } })
 * ```
 */
export function createClient(options: CoreClientOptions) {
  // Create hey-api client with baseUrl
  const client = createHeyApiClient(
    createConfig({
      baseUrl: options.baseUrl,
    }),
  )

  // Add request interceptor to inject auth token and headers
  client.interceptors.request.use(async request => {
    // Get auth token and headers
    const [token, extraHeaders] = await Promise.all([
      options.getAuthToken?.(),
      options.getHeaders?.(),
    ])

    // Set Authorization header if token exists
    if (token && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    // Merge custom headers
    if (extraHeaders) {
      Object.entries(extraHeaders).forEach(([key, value]) => {
        request.headers.set(key, value)
      })
    }

    return request
  })

  // Wrap api object to use client
  return wrapApiWithClient(api, client, options)
}
