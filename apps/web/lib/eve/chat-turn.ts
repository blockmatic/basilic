'use client'

import { coreClient } from '@/app/providers'
import { getAuthToken, refreshSessionViaNext } from '@/lib/auth/auth-client'
import type { SearchQueryState } from '@/lib/coins/search-query'
import type { ViewConfig } from '@/lib/genui'
import {
  assistantTextFromEvents,
  isEveHttpError,
  postEveSession,
  readStreamEvents,
} from './session-http'

const chatSessionKey = 'basilic.board.chatSession'

function recordOf(data: unknown) {
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
}

async function chatEndpoint() {
  const agents = await coreClient.listAgents()
  const chat = agents.find(agent => agent.id === 'chat')
  if (!chat?.endpoint) throw new Error('chat agent is not advertised')
  return chat.endpoint
}

async function bearerToken() {
  return (await getAuthToken()) ?? ''
}

async function postTurn({
  host,
  token,
  sessionId,
  prompt,
  boardQuery,
  viewConfig,
  elements,
  onAssistantDelta,
}: {
  host: string
  token: string
  sessionId: string | null
  prompt: string
  boardQuery: SearchQueryState
  viewConfig: ViewConfig
  elements: string[]
  onAssistantDelta?: (text: string) => void
}) {
  const posted = await postEveSession({
    host,
    token,
    sessionId,
    body: {
      message: prompt,
      clientContext: { boardQuery, viewConfig, elements },
    },
  })
  const seen: { type: string; data?: unknown }[] = []
  const events = await readStreamEvents({
    host,
    token,
    sessionId: posted.sessionId,
    onEvent: event => {
      seen.push(event)
      onAssistantDelta?.(assistantTextFromEvents({ events: seen }))
    },
  })
  if (events.some(event => event.type === 'session.failed')) throw new Error('chat session failed')
  const failedTurn = events.find(event => event.type === 'turn.failed')
  if (failedTurn) {
    const message = recordOf(failedTurn.data).message
    throw new Error(typeof message === 'string' && message ? message : 'chat turn failed')
  }
  return { sessionId: posted.sessionId, text: assistantTextFromEvents({ events }) }
}

async function sendWithRefresh(args: {
  host: string
  sessionId: string | null
  prompt: string
  boardQuery: SearchQueryState
  viewConfig: ViewConfig
  elements: string[]
  onAssistantDelta?: (text: string) => void
}) {
  const send = async () => postTurn({ ...args, token: await bearerToken() })
  try {
    return await send()
  } catch (error) {
    if (!isEveHttpError(error) || error.status !== 401) throw error
    const tokens = await refreshSessionViaNext()
    if (!tokens) throw error
    return send()
  }
}

export async function sendChatTurn({
  prompt,
  boardQuery,
  viewConfig,
  elements,
  onAssistantDelta,
}: {
  prompt: string
  boardQuery: SearchQueryState
  viewConfig: ViewConfig
  elements: string[]
  onAssistantDelta?: (text: string) => void
}) {
  const host = await chatEndpoint()
  const stored = sessionStorage.getItem(chatSessionKey)
  const sent = await sendWithRefresh({
    host,
    sessionId: stored,
    prompt,
    boardQuery,
    viewConfig,
    elements,
    onAssistantDelta,
  })
  sessionStorage.setItem(chatSessionKey, sent.sessionId)
  return sent
}
