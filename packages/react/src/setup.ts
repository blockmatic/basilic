import { type createClient, getClientConfig } from '@repo/core'
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

  /**
   * Base URL for chat API. Optional when client is from createClient with baseUrl.
   * Required for useChatFromConfig unless derived from client.
   */
  baseUrl?: string

  /**
   * Callback to get Bearer token for chat requests. Optional when client is from
   * createClient with getAuthToken. Required for useChatFromConfig unless derived from client.
   */
  getAuthToken?: () => Promise<string | null>

  /**
   * When set (e.g. Next.js `/api/auth/callback`), after Web3 verify success the client POSTs
   * `{ token, refreshToken }` here to set HttpOnly cookies. Omit for vanilla/Vue/SPA.
   */
  authCallbackUrl?: string

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

  /** When set, POST Web3 tokens here after verify (Next.js cookie exchange) */
  authCallbackUrl?: string

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
 * Derives baseUrl and getAuthToken from the client (via getClientConfig) when not
 * provided, when the client was created with createClient from @repo/core.
 *
 * @param options - React API configuration options
 * @returns Normalized configuration value for React context
 */
export function createReactApiConfig(options: ReactApiConfig): ReactApiConfigValue {
  const clientConfig = getClientConfig(options.client)
  const rawGetAuthToken = options.getAuthToken ?? clientConfig?.getAuthToken
  const getAuthToken = rawGetAuthToken
    ? async (): Promise<string | null> => (await rawGetAuthToken()) ?? null
    : undefined
  return {
    client: options.client,
    baseUrl: options.baseUrl ?? clientConfig?.baseUrl,
    getAuthToken,
    authCallbackUrl: options.authCallbackUrl,
    queryClient: options.queryClient,
    queryClientDefaults: options.queryClientDefaults ?? {},
  }
}
