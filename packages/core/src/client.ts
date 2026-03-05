import type { CoreApiClient } from './api-client.gen'
import { api } from './api-wrapper.gen'
import type { CoreClientOptions, JwtOptions } from './config'
import { ApiError } from './errors'
import { createConfig, createClient as createHeyApiClient } from './gen/client/index'
import * as gen from './gen/index'

// Lock to prevent multiple concurrent refresh attempts
let refreshLock: Promise<{ token: string; refreshToken: string } | null> | null = null

const clientConfigMap = new WeakMap<
  object,
  { baseUrl: string; getAuthToken?: () => string | null | Promise<string | null> }
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

function isApiKeyMode(
  options: CoreClientOptions,
): options is Extract<CoreClientOptions, { apiKey: string }> {
  return 'apiKey' in options && typeof options.apiKey === 'string'
}

function isJwtMode(options: CoreClientOptions): options is Extract<CoreClientOptions, JwtOptions> {
  return (
    'getRefreshToken' in options &&
    typeof options.getRefreshToken === 'function' &&
    'getAuthToken' in options &&
    typeof options.getAuthToken === 'function' &&
    'onTokensRefreshed' in options &&
    typeof options.onTokensRefreshed === 'function'
  )
}

async function doRefresh(
  options: CoreClientOptions,
  client: ReturnType<typeof createHeyApiClient>,
): Promise<{ token: string; refreshToken: string } | null> {
  if (isApiKeyMode(options)) return null
  if (!isJwtMode(options)) return null
  const refreshToken = await options.getRefreshToken()
  if (!refreshToken) return null
  const refreshResponse = await gen.refresh({ client, body: { refreshToken } })
  if (refreshResponse.error || !refreshResponse.data) return null
  await options.onTokensRefreshed(refreshResponse.data)
  return refreshResponse.data
}

function canAttemptRefresh(
  errorStatus: number,
  options: CoreClientOptions,
  isRefreshEndpoint: boolean,
): boolean {
  if (errorStatus !== 401 || isRefreshEndpoint) return false
  if (isApiKeyMode(options)) return false
  return isJwtMode(options)
}

function isRefreshEndpointUrl(url: string | undefined): boolean {
  return url?.includes('/auth/session/refresh') ?? false
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

      const isRefreshEndpoint = isRefreshEndpointUrl(response.request?.url)
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
 * @param options - Client configuration (apiKey, JWT callbacks, or no-auth)
 * @returns API client with nested namespace structure matching the OpenAPI spec
 *
 * @example API key mode
 * ```ts
 * const client = createClient({
 *   baseUrl: 'https://api.example.com',
 *   apiKey: 'bask_xxx_secret',
 * })
 * ```
 *
 * @example JWT mode
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
 *
 * @example No-auth mode
 * ```ts
 * const client = createClient({ baseUrl: 'https://api.example.com' })
 * ```
 */
export function createClient(options: CoreClientOptions): CoreApiClient {
  const client = createHeyApiClient(
    createConfig({
      baseUrl: options.baseUrl,
    }),
  )

  client.interceptors.request.use(async request => {
    const token = isApiKeyMode(options)
      ? options.apiKey
      : isJwtMode(options)
        ? await options.getAuthToken()
        : undefined

    const extraHeaders = await options.getHeaders?.()

    if (token && !request.headers.has('Authorization'))
      request.headers.set('Authorization', `Bearer ${token}`)

    if (extraHeaders)
      Object.entries(extraHeaders).forEach(([key, value]) => {
        request.headers.set(key, value)
      })

    return request
  })

  const wrapped = wrapApiWithClient(api, client, options) as unknown as CoreApiClient
  const getAuthToken = isApiKeyMode(options)
    ? () => options.apiKey
    : isJwtMode(options)
      ? options.getAuthToken
      : undefined
  clientConfigMap.set(wrapped, {
    baseUrl: options.baseUrl,
    getAuthToken,
  })
  return wrapped
}
