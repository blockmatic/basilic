import type { HealthCheckData, HealthCheckResponse } from '@repo/core'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context.js'
import { serializeQueryKeyValue } from '../gen/core/queryKeySerializer.gen.js'
import { healthCheck } from '../gen/index.js'

export function useHealthCheck(
  params?: Pick<HealthCheckData, 'query' | 'path'>,
  options?: Omit<UseQueryOptions<HealthCheckResponse, Error>, 'queryKey' | 'queryFn'>,
) {
  const { client, getAuthHeaders, queryClientDefaults } = useReactApiConfig()

  const queryParams = params?.query
  const pathParams = params?.path
  const queryKey = [
    'healthCheck',
    queryParams ? serializeQueryKeyValue(queryParams) : null,
    pathParams ? serializeQueryKeyValue(pathParams) : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return useQuery({
    queryKey,
    queryFn: async () => {
      const headers = await getAuthHeaders()
      const response = await healthCheck({
        client,
        ...(queryParams !== undefined && queryParams !== null && { query: queryParams }),
        ...(pathParams !== undefined && pathParams !== null && { path: pathParams }),
        ...(Object.keys(headers).length > 0 && { headers }),
      })
      if (!response.data) {
        const error = response.error as { message?: string } | undefined
        throw new Error(error?.message ?? 'Unknown error')
      }
      return response.data
    },
    ...queryClientDefaults,
    ...options,
  })
}
