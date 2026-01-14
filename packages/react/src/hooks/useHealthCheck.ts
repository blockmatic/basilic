import type { HealthCheckResponse } from '@repo/core'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context.js'
import * as gen from '../gen/index.js'

export function useHealthCheck(
  options?: Omit<UseQueryOptions<HealthCheckResponse, Error>, 'queryKey' | 'queryFn'>,
) {
  const { client, getAuthHeaders, queryClientDefaults } = useReactApiConfig()

  return useQuery({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const headers = await getAuthHeaders()
      const response = await gen.healthCheck({
        client,
        ...(Object.keys(headers).length > 0 && { headers }),
      })
      if (!response.data) {
        const error = response.error as { message?: string } | undefined
        throw new Error(error?.message ?? 'Unknown error')
      }
      return response.data
    },
    refetchInterval: 30000,
    ...queryClientDefaults,
    ...options,
  })
}
