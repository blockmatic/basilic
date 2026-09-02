import type { HealthCheckData, HealthCheckResponse } from '@repo/core'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

/**
 * React Query hook for health check endpoint.
 *
 * Fetches server health status (`ok`, `dbReady`). Uses the API client
 * configured in `ReactApiProvider` and applies default query options from context.
 *
 * @param params - Optional health check parameters (query params, etc.)
 * @param options - Additional TanStack Query options (merged with context defaults). Default queryKey is `['healthCheck', params]` but can be overridden.
 * @returns TanStack Query result with health check data
 *
 * @example
 * ```tsx
 * function HealthStatus() {
 *   const { data, isLoading, error } = useHealthCheck()
 *
 *   if (isLoading) return <div>Checking health...</div>
 *   if (error) return <div>Health check failed</div>
 *
 *   return (
 *     <div>
 *       API ok: {String(data?.ok)} — DB ready: {String(data?.dbReady)}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom query options
 * const { data } = useHealthCheck(undefined, { refetchInterval: 30000 })
 * ```
 *
 * @example
 * ```tsx
 * // With custom queryKey override
 * const { data } = useHealthCheck(undefined, { queryKey: ['custom-health-check'] })
 * ```
 */
export function useHealthCheck(
  params?: HealthCheckData,
  options?: Omit<UseQueryOptions<HealthCheckResponse, Error>, 'queryFn'>,
) {
  const { client, queryClientDefaults } = useReactApiConfig()

  return useQuery<HealthCheckResponse, Error>({
    queryKey: ['healthCheck', params],
    queryFn: async () => client.healthCheck(params),
    ...queryClientDefaults,
    ...options,
  })
}
