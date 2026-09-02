import { convertToModelMessages, type ModelMessage, type ToolSet } from 'ai'

export type ResolveMessagesResult =
  | { ok: true; messages: ModelMessage[] }
  | { ok: false; message: string }

export function isAllowedChatFileUrl({ url }: { url: string }): boolean {
  try {
    return new URL(url).protocol === 'data:'
  } catch {
    return false
  }
}

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

function validateUIMessageFileUrls(messages: unknown[]): ResolveMessagesResult | null {
  for (const msg of messages) {
    if (!isUIMessage(msg)) continue
    for (const part of msg.parts) {
      if (
        typeof part !== 'object' ||
        part === null ||
        !('type' in part) ||
        (part as { type: string }).type !== 'file' ||
        !('url' in part)
      )
        continue
      const url = (part as { url: unknown }).url
      if (typeof url !== 'string' || !isAllowedChatFileUrl({ url }))
        return { ok: false, message: 'Invalid request: file URL must be a data: URL' }
    }
  }
  return null
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

    const fileUrlError = validateUIMessageFileUrls(rawMessages)
    if (fileUrlError) return fileUrlError

    try {
      const messages = await convertToModelMessages(
        rawMessages as Parameters<typeof convertToModelMessages>[0],
        { tools, ignoreIncompleteToolCalls: true },
      )
      return { ok: true, messages }
    } catch {
      return {
        ok: false,
        message:
          'Invalid request: could not convert UIMessage parts (check file URLs and part shapes)',
      }
    }
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
