'use client'

import { coreClient } from '@/app/providers'
import { getAuthToken, refreshSessionViaNext } from '@/lib/auth/auth-client'
import type { SearchQueryState } from '@/lib/coins/search-query'
import { viewConfigFromEvents } from './parse-view'
import { isEveHttpError, postEveSession, readStreamEvents } from './session-http'

const commandSessionKey = 'basilic.board.commandSession'

async function commandEndpoint() {
  const agents = await coreClient.listAgents()
  const command = agents.find(agent => agent.id === 'command')
  if (!command?.endpoint) throw new Error('command agent is not advertised')
  return command.endpoint
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
}: {
  host: string
  token: string
  sessionId: string | null
  prompt: string
  boardQuery: SearchQueryState
}) {
  const posted = await postEveSession({
    host,
    token,
    sessionId,
    body: { message: prompt, clientContext: { boardQuery } },
  })
  const events = await readStreamEvents({ host, token, sessionId: posted.sessionId })
  if (events.some(event => event.type === 'session.failed'))
    throw new Error('command session failed')
  return { sessionId: posted.sessionId, events }
}

async function sendWithRefresh(args: {
  host: string
  sessionId: string | null
  prompt: string
  boardQuery: SearchQueryState
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

export async function sendCommandTurn({
  prompt,
  boardQuery,
}: {
  prompt: string
  boardQuery: SearchQueryState
}) {
  const host = await commandEndpoint()
  const stored = sessionStorage.getItem(commandSessionKey)
  const sent = await sendWithRefresh({
    host,
    sessionId: stored,
    prompt,
    boardQuery,
  })
  sessionStorage.setItem(commandSessionKey, sent.sessionId)
  const parsed = viewConfigFromEvents({ events: sent.events })
  if (!parsed) throw new Error('command agent did not return a ViewConfig')
  return { ...parsed, eveTurnId: sent.sessionId, eveSessionId: sent.sessionId }
}
