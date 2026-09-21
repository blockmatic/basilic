export type EveStreamEvent = { type: string; data?: unknown }

export type EveHttpError = Error & { status: number }

export const sessionPath = '/eve/v1/session'
export const sessionIdHeader = 'x-eve-session-id'

const sessionNotReadyDelaysMs = [200, 400, 800]

export function joinEveUrl({ host, path }: { host: string; path: string }) {
  const origin = host.replace(/\/$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function eveHttpError({ status, body }: { status: number; body: string }): EveHttpError {
  const error = new Error(body || `eve HTTP ${status}`) as EveHttpError
  error.status = status
  return error
}

export function isEveHttpError(error: unknown): error is EveHttpError {
  return error instanceof Error && 'status' in error && typeof error.status === 'number'
}

function recordOf(data: unknown) {
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}
}

function isTerminalStreamEvent(type: string) {
  return type === 'session.completed' || type === 'session.failed' || type === 'session.waiting'
}

export function eventsFromNdjson({ text }: { text: string }): EveStreamEvent[] {
  const events: EveStreamEvent[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parsed = JSON.parse(trimmed) as { type?: unknown; data?: unknown }
    if (typeof parsed.type !== 'string') continue
    events.push({ type: parsed.type, data: parsed.data })
    if (isTerminalStreamEvent(parsed.type)) break
  }
  return events
}

export function assistantTextFromEvents({ events }: { events: readonly EveStreamEvent[] }): string {
  const blocks = events.flatMap(event => {
    if (event.type !== 'message.completed') return []
    const message = recordOf(event.data).message
    if (typeof message !== 'string' || !message.trim()) return []
    return [message]
  })
  if (blocks.length) return blocks.join('\n')
  return events
    .map(event => {
      if (event.type !== 'message.appended') return ''
      const delta = recordOf(event.data).messageDelta
      return typeof delta === 'string' ? delta : ''
    })
    .join('')
}

function wait({ ms }: { ms: number }) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function withSessionReadyRetry<T>({ run }: { run: () => Promise<T> }): Promise<T> {
  let attempt = 0
  while (true)
    try {
      return await run()
    } catch (error) {
      if (
        !isEveHttpError(error) ||
        error.status !== 409 ||
        attempt >= sessionNotReadyDelaysMs.length
      )
        throw error
      await wait({ ms: sessionNotReadyDelaysMs[attempt] ?? 800 })
      attempt += 1
    }
}

export async function postEveSession({
  host,
  token,
  sessionId,
  body,
}: {
  host: string
  token: string
  sessionId: string | null
  body: unknown
}): Promise<{ sessionId: string }> {
  const path = sessionId ? `${sessionPath}/${encodeURIComponent(sessionId)}` : sessionPath
  return withSessionReadyRetry({
    run: async () => {
      const response = await fetch(joinEveUrl({ host, path }), {
        method: 'POST',
        redirect: 'manual',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (response.status === 409) throw eveHttpError({ status: 409, body: await response.text() })
      if (!response.ok) throw eveHttpError({ status: response.status, body: await response.text() })
      const json = (await response.json()) as { sessionId?: unknown }
      const nextSessionId =
        (typeof json.sessionId === 'string' ? json.sessionId : undefined) ??
        response.headers.get(sessionIdHeader)?.trim()
      if (!nextSessionId) throw new Error('eve session did not return a session id')
      return { sessionId: nextSessionId }
    },
  })
}

export async function readStreamEvents({
  host,
  token,
  sessionId,
  onEvent,
}: {
  host: string
  token: string
  sessionId: string
  onEvent?: (event: EveStreamEvent) => void
}): Promise<EveStreamEvent[]> {
  const response = await fetch(
    joinEveUrl({ host, path: `${sessionPath}/${encodeURIComponent(sessionId)}/stream` }),
    {
      cache: 'no-store',
      headers: { authorization: `Bearer ${token}` },
      redirect: 'manual',
    },
  )
  if (!response.ok) throw eveHttpError({ status: response.status, body: await response.text() })
  const events: EveStreamEvent[] = []
  const reader = response.body?.getReader()
  if (!reader) {
    for (const event of eventsFromNdjson({ text: await response.text() })) {
      events.push(event)
      onEvent?.(event)
    }
    return events
  }
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const parsed = JSON.parse(trimmed) as { type?: unknown; data?: unknown }
      if (typeof parsed.type !== 'string') continue
      const event = { type: parsed.type, data: parsed.data }
      events.push(event)
      onEvent?.(event)
      if (isTerminalStreamEvent(parsed.type)) return events
    }
  }
  const trailing = buffer.trim()
  if (!trailing) return events
  const parsed = JSON.parse(trailing) as { type?: unknown; data?: unknown }
  if (typeof parsed.type !== 'string') return events
  const event = { type: parsed.type, data: parsed.data }
  events.push(event)
  onEvent?.(event)
  return events
}
