'use client'

import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const linkProviders = ['github', 'facebook', 'twitter'] as const
export type OAuthLinkProvider = (typeof linkProviders)[number]

export function useOAuthLink(provider: OAuthLinkProvider) {
  const { client } = useReactApiConfig()

  return useMutation({
    mutationFn: async () => {
      const endpoints = {
        github: client.auth.oauth.github.linkAuthorizeUrl,
        facebook: client.auth.oauth.facebook.linkAuthorizeUrl,
        twitter: client.auth.oauth.twitter.linkAuthorizeUrl,
      }
      const data = await endpoints[provider]()
      const url = data?.redirectUrl
      if (typeof url !== 'string' || !url.trim())
        throw new Error(`OAuth redirectUrl missing or invalid for provider: ${provider}`)
      window.location.href = url
      return data
    },
  })
}
