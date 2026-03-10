'use client'

import { useMutation } from '@tanstack/react-query'
import { useReactApiConfig } from '../context'

const linkProviders = ['github', 'google', 'facebook', 'twitter'] as const
export type OAuthLinkProvider = (typeof linkProviders)[number]

export function useOAuthLink(provider: OAuthLinkProvider, redirectUri?: string) {
  const { client } = useReactApiConfig()

  return useMutation({
    mutationFn: async () => {
      const data =
        provider === 'google' && redirectUri
          ? await client.auth.oauth.google.linkAuthorizeUrl({
              query: {
                // biome-ignore lint/style/useNamingConvention: OAuth API expects redirect_uri
                redirect_uri: redirectUri,
              },
              throwOnError: true,
            })
          : await (
              {
                github: client.auth.oauth.github.linkAuthorizeUrl,
                google: client.auth.oauth.google.linkAuthorizeUrl,
                facebook: client.auth.oauth.facebook.linkAuthorizeUrl,
                twitter: client.auth.oauth.twitter.linkAuthorizeUrl,
              } as const
            )[provider]({ throwOnError: true })
      const url = data?.redirectUrl
      if (typeof url !== 'string' || !url.trim())
        throw new Error(`OAuth redirectUrl missing or invalid for provider: ${provider}`)
      window.location.href = url
      return data
    },
  })
}
