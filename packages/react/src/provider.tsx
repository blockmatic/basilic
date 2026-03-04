'use client'

import { type ReactNode, useMemo } from 'react'
import { ReactApiContext } from './context'
import type { ReactApiConfig } from './setup'
import { createReactApiConfig } from './setup'

/**
 * Provider component that makes API client and query configuration available to child components.
 *
 * Wraps your app (or a portion of it) to provide API client instance and TanStack Query defaults
 * to all hooks via React context. Must be used within a `QueryClientProvider` from `@tanstack/react-query`.
 *
 * @param props - Configuration options and children
 * @param props.client - API client instance from `@repo/core`
 * @param props.baseUrl - Optional. Derived from client when created with createClient.
 * @param props.getAuthToken - Optional. Derived from client when created with createClient.
 * @param props.authCallbackUrl - Optional. Next.js cookie exchange URL after Web3 verify.
 * @param props.queryClient - Optional TanStack Query client instance
 * @param props.queryClientDefaults - Default query options applied to all hooks
 * @param props.children - React children components
 *
 * @example
 * ```tsx
 * import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 * import { ReactApiProvider } from '@repo/react'
 * import { createClient } from '@repo/core'
 *
 * const queryClient = new QueryClient()
 * const apiClient = createClient({
 *   baseUrl: 'https://api.example.com',
 *   getAuthToken: async () => localStorage.getItem('accessToken'),
 * })
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <ReactApiProvider client={apiClient}>
 *         <MyComponent />
 *       </ReactApiProvider>
 *     </QueryClientProvider>
 *   )
 * }
 * ```
 */
export function ReactApiProvider({
  children,
  ...config
}: ReactApiConfig & { children: ReactNode }): React.JSX.Element {
  const apiConfig = useMemo(() => createReactApiConfig(config), [config])

  return <ReactApiContext.Provider value={apiConfig}>{children}</ReactApiContext.Provider>
}
