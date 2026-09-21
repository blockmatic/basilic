export function joinEveUrl({ host, path }: { host: string; path: string }) {
  const origin = host.replace(/\/$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function eventsFromNdjson({ text }: { text: string }) {
  const events: { type: string; data?: unknown }[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parsed = JSON.parse(trimmed) as { type?: unknown; data?: unknown }
    if (typeof parsed.type !== 'string') continue
    events.push({ type: parsed.type, data: parsed.data })
    if (
      parsed.type === 'session.completed' ||
      parsed.type === 'session.failed' ||
      parsed.type === 'session.waiting'
    )
      break
  }
  return events
}
