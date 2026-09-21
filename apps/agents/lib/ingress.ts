export function isAllowedChatFileUrl({ url }: { url: string }): boolean {
  try {
    return new URL(url).protocol === 'data:'
  } catch {
    return false
  }
}

export function inspectSessionPayload({
  body,
}: {
  body: unknown
}): { ok: true } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) return { ok: true }
  const record = body as Record<string, unknown>
  const messages = record.messages
  if (!Array.isArray(messages)) return { ok: true }
  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null || !('role' in msg)) continue
    if ((msg as { role: unknown }).role === 'system')
      return { ok: false, message: 'Invalid request: system role messages are not allowed' }
    if (!('parts' in msg) || !Array.isArray((msg as { parts?: unknown[] }).parts)) continue
    for (const part of (msg as { parts: unknown[] }).parts) {
      if (typeof part !== 'object' || part === null || !('type' in part)) continue
      if ((part as { type: unknown }).type !== 'file' || !('url' in part)) continue
      const url = (part as { url: unknown }).url
      if (typeof url !== 'string' || !isAllowedChatFileUrl({ url }))
        return { ok: false, message: 'Invalid request: file URL must be a data: URL' }
    }
  }
  return { ok: true }
}
