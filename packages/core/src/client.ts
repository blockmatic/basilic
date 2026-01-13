import { appContract } from '@basilic/contracts'
import { initClient } from '@ts-rest/core'

export type CoreClientOptions = {
  baseUrl: string
  getAuthToken?: () => string | null | Promise<string | null>
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}

export function createClient({ baseUrl, getAuthToken, getHeaders }: CoreClientOptions) {
  return initClient(appContract, {
    baseUrl,
    fetch: async (url: string | URL, options: RequestInit = {}) => {
      // Get async headers
      const [token, extra] = await Promise.all([getAuthToken?.(), getHeaders?.()])

      // Merge headers
      const headers = new Headers(options.headers)
      if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
          headers.set(key, value)
        })
      }
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      // Call fetch with merged headers
      return fetch(url, {
        ...options,
        headers,
      })
    },
  })
}
