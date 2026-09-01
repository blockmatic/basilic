import { ApiError } from '@repo/core'

export function getApiErrorCode(error: unknown): string | undefined {
  if (
    !(error instanceof ApiError) ||
    !error.body ||
    typeof error.body !== 'object' ||
    !('code' in error.body)
  )
    return undefined
  const code = (error.body as { code?: unknown }).code
  return typeof code === 'string' ? code : undefined
}

export function isRateLimitApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 429 || getApiErrorCode(error) === 'RATE_LIMIT_EXCEEDED')
  )
}
