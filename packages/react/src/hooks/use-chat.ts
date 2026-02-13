'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useReactApiConfig } from '../context'

/**
 * useChat wrapper that uses ReactApiProvider config (baseUrl, getAuthToken).
 * Sends requests directly to Fastify /ai/chat with Bearer auth.
 *
 * @throws Error if baseUrl or getAuthToken is not configured in ReactApiProvider
 */
export function useChatFromConfig(
  options?: Parameters<typeof useChat>[0],
): ReturnType<typeof useChat> {
  const config = useReactApiConfig()

  if (!config.baseUrl || !config.getAuthToken) {
    throw new Error(
      'useChatFromConfig requires baseUrl and getAuthToken in ReactApiProvider. ' +
        'Pass baseUrl={env.NEXT_PUBLIC_API_URL} and getAuthToken={...} to ReactApiProvider.',
    )
  }

  const api = `${config.baseUrl.replace(/\/$/, '')}/ai/chat`
  const getAuthToken = config.getAuthToken

  const transport = new DefaultChatTransport({
    api,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getAuthToken()
      const headers = new Headers(init?.headers)
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Accept', 'text/event-stream')
      return fetch(input, { ...init, headers })
    },
  })

  return useChat({ ...options, transport })
}
