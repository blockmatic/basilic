/** Extract token exchange error for Google OAuth; returns null if not a known error. */
export function buildTokenExchangeError(err: unknown): { code: string; message: string } | null {
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
    return { code: 'TOKEN_EXCHANGE_FAILED', message: 'Token exchange timed out' }
  if (err && typeof err === 'object' && 'tokenData' in err) {
    const e = err as { tokenData: { error?: string } }
    return {
      code: 'TOKEN_EXCHANGE_FAILED',
      message: e.tokenData.error ?? 'Failed to exchange code for token',
    }
  }
  return null
}

/** Extract user info fetch error for Google OAuth; returns null if not a known error. */
export function buildUserInfoError(err: unknown): { code: string; message: string } | null {
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
    return { code: 'USER_INFO_FAILED', message: 'Failed to fetch Google user (timeout)' }
  if (err && typeof err === 'object' && 'gUser' in err)
    return { code: 'USER_INFO_FAILED', message: 'Failed to fetch Google user' }
  return null
}
