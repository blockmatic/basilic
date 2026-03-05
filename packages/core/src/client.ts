import type { CoreApiClient } from './api-client.gen'
import { api } from './api-wrapper.gen'
import type { CoreClientOptions } from './config'
import { ApiError } from './errors'
import { createConfig, createClient as createHeyApiClient } from './gen/client/index'
import * as gen from './gen/index'

// Lock to prevent multiple concurrent refresh attempts
let refreshLock: Promise<{ token: string; refreshToken: string } | null> | null = null

const clientConfigMap = new WeakMap<
  object,
  { baseUrl: string; getAuthToken?: CoreClientOptions['getAuthToken'] }
>()

/** Config subset exposed to consumers (e.g. ReactApiProvider) for auth/URL. */
export type ClientConfig = {
  baseUrl: string
  getAuthToken?: () => string | null | Promise<string | null>
}

/** Returns auth/URL config for a client created with createClient, or undefined. */
export function getClientConfig(client: unknown): ClientConfig | undefined {
  return client && typeof client === 'object' ? clientConfigMap.get(client as object) : undefined
}

function getErrorFromResponse(response: { error?: unknown; response?: { status?: number } }): {
  status: number
  message: string
} {
  const status =
    response.error && typeof response.error === 'object' && 'status' in response.error
      ? (response.error as { status: number }).status
      : (response.response?.status ?? 500)
  const message =
    (response.error && typeof response.error === 'object' && 'message' in response.error
      ? (response.error as { message?: string }).message
      : undefined) ?? 'Unknown error'
  return { status, message }
}

async function doRefresh(
  options: CoreClientOptions,
  client: ReturnType<typeof createHeyApiClient>,
): Promise<{ token: string; refreshToken: string } | null> {
  if (options.refreshUrl) {
    const res = await fetch(options.refreshUrl, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok ? { token: '', refreshToken: '' } : null
  }
  const refreshToken = await options.getRefreshToken?.()
  if (!refreshToken) return null
  const refreshResponse = await gen.refresh({ client, body: { refreshToken } })
  if (refreshResponse.error || !refreshResponse.data) return null
  await options.onTokensRefreshed?.(refreshResponse.data)
  return refreshResponse.data
}

function canAttemptRefresh(
  errorStatus: number,
  options: CoreClientOptions,
  isRefreshEndpoint: boolean,
): boolean {
  if (errorStatus !== 401 || isRefreshEndpoint) return false
  if (options.refreshUrl) return true
  return !!(options.getRefreshToken && options.onTokensRefreshed)
}

async function tryRefreshAndRetry<T extends { data?: unknown; error?: unknown }>({
  obj,
  callOptions,
  client,
  options,
}: {
  obj: (opts: Record<string, unknown>) => Promise<T>
  callOptions: Record<string, unknown>
  client: ReturnType<typeof createHeyApiClient>
  options: CoreClientOptions
}): Promise<T['data'] | undefined> {
  try {
    if (!refreshLock) refreshLock = doRefresh(options, client)
    const newTokens = await refreshLock
    refreshLock = null

    if (!newTokens) return undefined
    const retryResponse = await obj({ ...callOptions, client })
    if (retryResponse.error) {
      const { status: s, message: m } = getErrorFromResponse(retryResponse)
      throw new ApiError(s, m, retryResponse.error)
    }
    return retryResponse.data
  } catch {
    refreshLock = null
    return undefined
  }
}

function wrapApiWithClient<T>(
  obj: T,
  client: ReturnType<typeof createHeyApiClient>,
  options: CoreClientOptions,
): T {
  if (typeof obj === 'function')
    return (async (callOptions: Record<string, unknown> = {}) => {
      const response = await obj({ ...callOptions, client })
      const { status: errorStatus, message: errorMessage } = getErrorFromResponse(response)

      const isRefreshEndpoint =
        (response.request?.url?.includes('/auth/session/refresh') ?? false) ||
        !!(options.refreshUrl && response.request?.url?.includes(options.refreshUrl))
      const shouldAttemptRefresh = canAttemptRefresh(errorStatus, options, isRefreshEndpoint)

      if (response.error && shouldAttemptRefresh) {
        const retryData = await tryRefreshAndRetry({
          obj: obj as (opts: Record<string, unknown>) => Promise<{
            data?: unknown
            error?: unknown
          }>,
          callOptions,
          client,
          options,
        })
        if (retryData !== undefined) return retryData
      }

      if (response.error) throw new ApiError(errorStatus, errorMessage, response.error)
      return response.data
    }) as T

  if (obj && typeof obj === 'object') {
    const wrapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj))
      wrapped[key] = wrapApiWithClient(value, client, options)

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
export function createClient(options: CoreClientOptions): CoreApiClient {
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
    if (token && !request.headers.has('Authorization'))
      request.headers.set('Authorization', `Bearer ${token}`)

    // Merge custom headers
    if (extraHeaders)
      Object.entries(extraHeaders).forEach(([key, value]) => {
        request.headers.set(key, value)
      })

    return request
  })

  // Wrap api object to use client (returns data only, throws on error).
  // Cast needed: wrapApiWithClient preserves raw SDK type but runtime returns data only.
  const wrapped = wrapApiWithClient(api, client, options) as unknown as CoreApiClient
  clientConfigMap.set(wrapped, {
    baseUrl: options.baseUrl,
    getAuthToken: options.getAuthToken,
  })
  return wrapped
}
