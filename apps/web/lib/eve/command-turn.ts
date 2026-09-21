'use client'

import { coreClient } from '@/app/providers'
import { getAuthToken, refreshSessionViaNext } from '@/lib/auth/auth-client'
import type { SearchQueryState } from '@/lib/coins/search-query'
import { viewConfigFromEvents } from './parse-view'
import { eventsFromNdjson, joinEveUrl } from './session-http'

const commandSessionKey = 'basilic.board.commandSession'
const sessionPath = '/eve/v1/session'
const sessionIdHeader = 'x-eve-session-id'

function eveHttpError({ status, body }: { status: number; body: string }) {
  const error = new Error(body || `eve HTTP ${status}`) as Error & { status: number }
  error.status = status
  return error
}

function isEveHttpError(error: unknown): error is Error & { status: number } {
  return error instanceof Error && 'status' in error && typeof error.status === 'number'
}

async function commandEndpoint() {
  const agents = await coreClient.listAgents()
  const command = agents.find(agent => agent.id === 'command')
  if (!command?.endpoint) throw new Error('command agent is not advertised')
  return command.endpoint
}

async function bearerToken() {
  return (await getAuthToken()) ?? ''
}

async function readStreamEvents({
  host,
  token,
  sessionId,
}: {
  host: string
  token: string
  sessionId: string
}) {
  const response = await fetch(
    joinEveUrl({ host, path: `${sessionPath}/${encodeURIComponent(sessionId)}/stream` }),
    {
      cache: 'no-store',
      headers: { authorization: `Bearer ${token}` },
      redirect: 'manual',
    },
  )
  if (!response.ok) throw eveHttpError({ status: response.status, body: await response.text() })
  return eventsFromNdjson({ text: await response.text() })
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
  const path = sessionId ? `${sessionPath}/${encodeURIComponent(sessionId)}` : sessionPath
  const response = await fetch(joinEveUrl({ host, path }), {
    method: 'POST',
    redirect: 'manual',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message: prompt, clientContext: { boardQuery } }),
  })
  if (!response.ok) throw eveHttpError({ status: response.status, body: await response.text() })
  const json = (await response.json()) as { sessionId?: unknown }
  const nextSessionId =
    (typeof json.sessionId === 'string' ? json.sessionId : undefined) ??
    response.headers.get(sessionIdHeader)?.trim()
  if (!nextSessionId) throw new Error('command session did not return a session id')
  const events = await readStreamEvents({ host, token, sessionId: nextSessionId })
  if (events.some(event => event.type === 'session.failed'))
    throw new Error('command session failed')
  return { sessionId: nextSessionId, events }
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
