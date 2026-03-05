'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useReactApiConfig } from '../context'

/**
 * useChat wrapper that uses ReactApiProvider config (baseUrl, getAuthToken).
 * Sends requests directly to Fastify /ai/chat with Bearer auth.
 *
 * baseUrl and getAuthToken can come from ReactApiProvider props or from the client
 * when created with createClient from @repo/core.
 *
 * @throws Error if baseUrl or getAuthToken is not available in ReactApiProvider or on the client
 */
export function useChatFromConfig(
  options?: Parameters<typeof useChat>[0],
): ReturnType<typeof useChat> {
  const config = useReactApiConfig()

  if (!config.baseUrl || !config.getAuthToken)
    throw new Error(
      'useChatFromConfig requires baseUrl and getAuthToken in ReactApiProvider or on the client (createClient from @repo/core). ' +
        'Pass baseUrl and getAuthToken to createClient, or to ReactApiProvider.',
    )

  const api = `${config.baseUrl.replace(/\/$/, '')}/ai/chat`
  const getAuthToken = config.getAuthToken
  const stream = (options as { stream?: boolean })?.stream !== false

  const transport = new DefaultChatTransport({
    api,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getAuthToken()
      const headers = new Headers(init?.headers)
      if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

      const initWithStream = init as RequestInit & { keepStream?: boolean }
      const wantsStreaming =
        stream || headers.get('X-Stream') === '1' || initWithStream?.keepStream === true
      if (!headers.has('Accept') && wantsStreaming) headers.set('Accept', 'text/event-stream')

      return fetch(input, { ...init, headers })
    },
  })

  return useChat({ ...options, transport })
}
