const creditPattern = /insufficient_quota|insufficient_credits|quota_exceeded|credits_exceeded|402/i

function errorToString(err: unknown): string {
  if (err instanceof Error) {
    const parts = [err.message]
    if (err.cause != null) parts.push(String(err.cause))
    return parts.join(' ')
  }
  return String(err)
}

export function isInsufficientCreditsError(err: unknown): boolean {
  const obj = err as { status?: number; statusCode?: number }
  if (obj.status === 402 || obj.statusCode === 402) return true
  return creditPattern.test(errorToString(err))
}
