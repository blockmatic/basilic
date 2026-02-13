import type { createClient } from '@repo/core'
import type { QueryClient } from '@tanstack/react-query'

/**
 * Configuration options for React API provider.
 *
 * @example
 * ```tsx
 * const config: ReactApiConfig = {
 *   client: createClient({ baseUrl: 'https://api.example.com' }),
 *   queryClient: new QueryClient(),
 *   queryClientDefaults: {
 *     retry: 3,
 *     staleTime: 5 * 60 * 1000, // 5 minutes
 *   },
 * }
 * ```
 */
export type ReactApiConfig = {
  /** API client instance from `@repo/core` */
  client: ReturnType<typeof createClient>

  /** Base URL for chat API (e.g. env.NEXT_PUBLIC_API_URL). Required for useChat. */
  baseUrl?: string

  /** Callback to get Bearer token for chat requests. Required for useChat. */
  getAuthToken?: () => Promise<string | null>

  /** Optional TanStack Query client instance */
  queryClient?: QueryClient

  /** Default query options applied to all hooks */
  queryClientDefaults?: {
    /** Number of retry attempts on failure */
    retry?: number

    /** Time in milliseconds before data is considered stale */
    staleTime?: number
  }
}

/**
 * Internal configuration value stored in React context.
 * Includes normalized defaults for query client options.
 */
export type ReactApiConfigValue = {
  /** API client instance from `@repo/core` */
  client: ReturnType<typeof createClient>

  /** Base URL for chat API */
  baseUrl?: string

  /** Callback to get Bearer token for chat requests */
  getAuthToken?: () => Promise<string | null>

  /** Optional TanStack Query client instance */
  queryClient?: QueryClient

  /** Normalized default query options (always an object, never undefined) */
  queryClientDefaults: {
    /** Number of retry attempts on failure */
    retry?: number

    /** Time in milliseconds before data is considered stale */
    staleTime?: number
  }
}

/**
 * Creates normalized React API configuration value.
 *
 * Normalizes the configuration by ensuring `queryClientDefaults` is always an object.
 *
 * @param options - React API configuration options
 * @returns Normalized configuration value for React context
 */
export function createReactApiConfig(options: ReactApiConfig): ReactApiConfigValue {
  return {
    client: options.client,
    baseUrl: options.baseUrl,
    getAuthToken: options.getAuthToken,
    queryClient: options.queryClient,
    queryClientDefaults: options.queryClientDefaults ?? {},
  }
}
