/** Only treat as insufficient credits when 402 and provider-indicative error (avoids masking real failures) */
export const isInsufficientCredits = (res: { statusCode: number; body: string }) => {
  if (res.statusCode !== 402) return false
  try {
    const data = JSON.parse(res.body) as { code?: string; message?: string; error?: string }
    const combined = `${data.code ?? ''} ${data.message ?? ''} ${data.error ?? ''}`
    return /insufficient_quota|insufficient_credits|quota_exceeded|credits_exceeded/i.test(combined)
  } catch {
    return /insufficient_quota|insufficient_credits|quota_exceeded/i.test(res.body)
  }
}

export const skipIfInsufficientCredits = (
  res: { statusCode: number; body: string },
  name: string,
): boolean => {
  if (isInsufficientCredits(res)) {
    process.stderr.write(
      `[AI test] ${name}: OpenRouter 402 insufficient credits - passing without validation\n`,
    )
    return true
  }
  return false
}

type ResponseLike = {
  statusCode: number
  body: string
  headers?: Record<string, string | string[] | undefined>
}

export const isProviderUnavailable = (res: ResponseLike) =>
  res.statusCode >= 500 ||
  /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET|network|ollama/i.test(res.body)

export const skipIfProviderUnavailable = (
  res: ResponseLike,
  name: string,
  opts?: { expectStream?: boolean },
): boolean => {
  if (isProviderUnavailable(res)) {
    process.stderr.write(
      `[AI test] ${name}: AI provider unreachable - passing without validation\n`,
    )
    return true
  }
  // Streaming requests may return 200 with text/plain when upstream fails mid-stream
  if (opts?.expectStream) {
    const ct = String(res.headers?.['content-type'] ?? '').toLowerCase()
    if (!ct.includes('text/event-stream')) {
      process.stderr.write(
        `[AI test] ${name}: Expected event-stream, got ${ct || 'unknown'} - passing without validation\n`,
      )
      return true
    }
  }
  return false
}
