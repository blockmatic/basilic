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
  headers?: Record<string, string | string[] | number | undefined>
}

export const isProviderUnavailable = (res: ResponseLike) =>
  res.statusCode === 502 ||
  res.statusCode === 503 ||
  res.statusCode === 504 ||
  /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(res.body)

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
  if (opts?.expectStream) {
    const ct = String(res.headers?.['content-type'] ?? '').toLowerCase()
    if (!ct.includes('text/event-stream')) {
      const hasUpstreamFailure =
        res.statusCode === 502 ||
        res.statusCode === 503 ||
        res.statusCode === 504 ||
        /ECONNREFUSED|fetch failed|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(res.body)
      if (hasUpstreamFailure) {
        process.stderr.write(
          `[AI test] ${name}: Expected event-stream, got ${ct || 'unknown'} - upstream failure, passing\n`,
        )
        return true
      }
      process.stderr.write(
        `[AI test] ${name}: Expected event-stream, got ${ct || 'unknown'} - route bug, failing\n`,
      )
      return false
    }
  }
  return false
}
