const creditPattern =
  /insufficient_quota|insufficient_credits|quota_exceeded|credits_exceeded|\b402\b/i

function errorToString(err: unknown): string {
  if (err instanceof Error) {
    const parts = [err.message]
    if (err.cause != null) parts.push(String(err.cause))
    return parts.join(' ')
  }
  return String(err)
}

function hasInsufficientCreditsStatus(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const status = (err as { status?: unknown }).status
  const statusCode = (err as { statusCode?: unknown }).statusCode
  return status === 402 || statusCode === 402
}

export function isInsufficientCreditsError(err: unknown): boolean {
  if (hasInsufficientCreditsStatus(err)) return true
  return creditPattern.test(errorToString(err))
}

/** HTTP response check for AI remote tests — only upstream quota mapping, not other 402 billing paths. */
export function isInsufficientCreditsResponse(res: { statusCode: number; body: string }): boolean {
  if (res.statusCode !== 402) return false
  try {
    const data = JSON.parse(res.body) as { code?: string }
    return data.code === 'INSUFFICIENT_CREDITS'
  } catch {
    return false
  }
}
