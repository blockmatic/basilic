import type { CoreClientOptions } from './config.js'
import { ApiError } from './errors.js'
import { createClient, createConfig } from './gen/client/index.js'
import * as gen from './gen/index.js'

// Create client factory with auth headers
function createApiClient(options: CoreClientOptions) {
  const config = createConfig({
    baseUrl: options.baseUrl,
  })

  return createClient(config)
}

// Wrapper API - stable public interface
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
      if (extraHeaders) {
        Object.assign(headers, extraHeaders)
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await gen.healthCheck({
        client,
        ...(Object.keys(headers).length > 0 && { headers }),
      })

      if (!response.data) {
        throw new ApiError(
          (response.error as { status?: number })?.status ?? 500,
          (response.error as { message?: string })?.message ?? 'Unknown error',
          response.error,
        )
      }
      return response.data
    },
  }
}

// Export types from generated code
export type { HealthCheckResponse } from './gen/types.gen.js'
