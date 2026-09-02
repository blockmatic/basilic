'use client'

import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '../../context'

const queryKey = ['auth', 'oauth', 'providers'] as const

export function useOAuthProviders() {
  const { client } = useReactApiConfig()
  const { data, isPending, isError, error } = useQuery({
    queryKey,
    queryFn: () => client.auth.oauth.providers({ throwOnError: true }),
    staleTime: 5 * 60 * 1000,
  })
  return {
    github: data?.github ?? false,
    githubHasRedirectConfig: data?.githubHasRedirectConfig ?? false,
    google: data?.google ?? false,
    googleHasRedirectConfig: data?.googleHasRedirectConfig ?? false,
    facebook: data?.facebook ?? false,
    facebookHasRedirectConfig: data?.facebookHasRedirectConfig ?? false,
    twitter: data?.twitter ?? false,
    twitterHasRedirectConfig: data?.twitterHasRedirectConfig ?? false,
    isPending,
    isError,
    error,
  }
}
