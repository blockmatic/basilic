'use client'

import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const queryKey = ['auth', 'oauth', 'providers'] as const

export function useOAuthProviders() {
  const { client } = useReactApiConfig()
  const { data } = useQuery({
    queryKey,
    queryFn: () => client.auth.oauth.providers({ throwOnError: true }),
    staleTime: 5 * 60 * 1000,
  })
  return {
    github: data?.github ?? false,
    google: data?.google ?? false,
    facebook: data?.facebook ?? false,
    twitter: data?.twitter ?? false,
  }
}
