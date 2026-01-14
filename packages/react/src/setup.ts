import type { CoreClientOptions } from '@repo/core'
import type { QueryClient } from '@tanstack/react-query'
import { createClient, createConfig } from './gen/client/index.js'

export type ReactApiConfig = CoreClientOptions & {
  queryClient?: QueryClient
  queryClientDefaults?: {
    retry?: number
    staleTime?: number
  }
}

export function createReactApiConfig(options: ReactApiConfig) {
  const config = createConfig({
    baseUrl: options.baseUrl,
  })

  const client = createClient(config)

  return {
    client,
    getAuthHeaders: async () => {
      const [token, extraHeaders] = await Promise.all([
        options.getAuthToken?.(),
        options.getHeaders?.(),
      ])

      const headers: Record<string, string> = {}
      if (extraHeaders) {
        Object.assign(headers, extraHeaders)
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      return headers
    },
    queryClient: options.queryClient,
    queryClientDefaults: options.queryClientDefaults ?? {},
  }
}
