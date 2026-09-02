import { convertToModelMessages, type ModelMessage, type ToolSet } from 'ai'

export type ResolveMessagesResult =
  | { ok: true; messages: ModelMessage[] }
  | { ok: false; message: string }

function isUIMessage(msg: unknown): msg is { role: string; parts: unknown[] } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'parts' in msg &&
    Array.isArray((msg as { parts?: unknown[] }).parts)
  )
}

function isCoreMessage(msg: unknown): msg is { role: string; content: string } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'content' in msg &&
    typeof (msg as { content?: unknown }).content === 'string' &&
    'role' in msg
  )
}

function hasSystemRole(messages: unknown[]): boolean {
  return messages.some(msg => {
    if (typeof msg !== 'object' || msg === null || !('role' in msg)) return false
    return (msg as { role: string }).role === 'system'
  })
}

export async function resolveMessages(
  rawMessages: unknown[],
  tools: ToolSet,
): Promise<ResolveMessagesResult> {
  if (hasSystemRole(rawMessages))
    return { ok: false, message: 'Invalid request: system role messages are not allowed' }

  const first = rawMessages[0]
  if (isUIMessage(first)) {
    const allUIMessage = rawMessages.every(isUIMessage)
    if (!allUIMessage)
      return { ok: false, message: 'Invalid request: mixed UIMessage and CoreMessage formats' }

    const messages = await convertToModelMessages(
      rawMessages as Parameters<typeof convertToModelMessages>[0],
      { tools, ignoreIncompleteToolCalls: true },
    )
    return { ok: true, messages }
  }
  if (isCoreMessage(first)) {
    const allCore = rawMessages.every(isCoreMessage)
    if (!allCore)
      return { ok: false, message: 'Invalid request: mixed UIMessage and CoreMessage formats' }

    return { ok: true, messages: rawMessages as ModelMessage[] }
  }
  return {
    ok: false,
    message: 'Invalid request: each message must have parts (UIMessage) or content (CoreMessage)',
  }
}
