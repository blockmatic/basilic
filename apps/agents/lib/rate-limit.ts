export function consumeRateLimit({
  hits,
  now,
  windowMs,
  max,
}: {
  hits: number[]
  now: number
  windowMs: number
  max: number
}): { ok: true; hits: number[] } | { ok: false; hits: number[]; retryAfterSeconds: number } {
  const recent = hits.filter(at => now - at < windowMs)
  if (recent.length >= max) {
    const oldest = recent[0] ?? now
    return {
      ok: false,
      hits: recent,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    }
  }
  return { ok: true, hits: [...recent, now] }
}
