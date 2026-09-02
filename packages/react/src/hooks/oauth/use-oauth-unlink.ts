'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactApiConfig } from '../../context'

const unlinkProviders = ['github', 'facebook', 'twitter', 'google'] as const
export type OAuthUnlinkProvider = (typeof unlinkProviders)[number]

export function useOAuthUnlink() {
  const { client } = useReactApiConfig()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (providerId: OAuthUnlinkProvider) => {
      await client.account.link.oauth.providerId({
        path: { providerId },
        throwOnError: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session', 'user'] })
    },
  })
}
