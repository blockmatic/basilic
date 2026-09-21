export const chatSessionKey = 'basilic.board.chatSession'
export const commandSessionKey = 'basilic.board.commandSession'

export type EveSessionCursor = { sessionId: string; streamIndex: number }

export function parseEveSessionCursor({
  value,
}: {
  value: string | undefined
}): EveSessionCursor | undefined {
  if (!value) return
  try {
    const parsed = JSON.parse(value) as unknown
    if (typeof parsed === 'string' && parsed) return { sessionId: parsed, streamIndex: 0 }
    if (typeof parsed !== 'object' || parsed === null) return
    const sessionId = 'sessionId' in parsed ? parsed.sessionId : undefined
    const streamIndex = 'streamIndex' in parsed ? parsed.streamIndex : undefined
    if (typeof sessionId !== 'string' || !sessionId) return
    return {
      sessionId,
      streamIndex:
        typeof streamIndex === 'number' && Number.isFinite(streamIndex) ? streamIndex : 0,
    }
  } catch {
    if (value) return { sessionId: value, streamIndex: 0 }
  }
}

export function serializeEveSessionCursor({
  session,
}: {
  session: EveSessionCursor | null | undefined
}): string | undefined {
  if (!session?.sessionId) return
  return JSON.stringify({ sessionId: session.sessionId, streamIndex: session.streamIndex })
}
