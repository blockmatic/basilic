import type { CoreClientOptions } from './config'
import { ApiError } from './errors'
import { createClient, createConfig } from './gen/client/index'
import * as gen from './gen/index'

/**
 * Creates a hey-api client instance with base URL configuration.
 *
 * @internal This is an internal implementation detail, not part of public API
 * @param options - Client configuration options
 * @returns Configured hey-api client instance
 */
function createApiClient(options: CoreClientOptions) {
  const config = createConfig({
    baseUrl: options.baseUrl,
  })

  return createClient(config)
}

/**
 * Creates a simplified API client with a flat API surface.
 *
 * Unlike `createClient`, this provides a simpler API without nested namespaces.
 * Use this when you prefer a flatter API structure over the nested namespace API.
 *
 * @param options - Client configuration options
 * @returns API client with flat method structure
 *
 * @example
 * ```ts
 * const api = createApi({
 *   baseUrl: 'https://api.example.com',
 *   getAuthToken: async () => localStorage.getItem('accessToken'),
 * })
 *
 * // Flat API
 * const health = await api.healthCheck()
 * ```
 */
export function createApi(options: CoreClientOptions) {
  const client = createApiClient(options)

  return {
    async healthCheck() {
      // Get auth headers
      const [token, extraHeaders] = await Promise.all([
        options.getAuthToken?.(),
        options.getHeaders?.(),
      ])

      // Build headers
      const headers: Record<string, string> = {}
      if (extraHeaders) Object.assign(headers, extraHeaders)

      if (token) headers.Authorization = `Bearer ${token}`

      const response = await gen.healthCheck({
        client,
        ...(Object.keys(headers).length > 0 && { headers }),
      })

      if (!response.data)
        throw new ApiError(
          (response.error as { status?: number })?.status ?? 500,
          (response.error as { message?: string })?.message ?? 'Unknown error',
          response.error,
        )

      return response.data
    },
  }
}

// Export types from generated code
export type { HealthCheckResponse } from './gen/types.gen'
