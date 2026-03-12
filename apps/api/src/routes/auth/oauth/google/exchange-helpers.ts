type OAuthError = { code: string; message: string; status?: number }

type AllowedStatus = 400 | 401 | 429 | 500 | 503 | 504

/** Map upstream HTTP status to allowed OAuth exchange response codes. */
export function toAllowedStatus(raw: number, fallback: AllowedStatus = 400): AllowedStatus {
  if (raw === 401 || raw === 429) return raw
  if (raw >= 500) return raw === 504 ? 504 : raw === 503 ? 503 : 500
  return fallback
}

/** Extract token exchange error for Google OAuth; returns null if not a known error. */
export function buildTokenExchangeError(err: unknown): OAuthError | null {
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
    return { code: 'TOKEN_EXCHANGE_FAILED', message: 'Token exchange timed out' }
  if (err && typeof err === 'object' && 'tokenData' in err) {
    const e = err as { tokenData: { error?: string }; status?: number }
    return {
      code: 'TOKEN_EXCHANGE_FAILED',
      message: e.tokenData.error ?? 'Failed to exchange code for token',
      status: e.status,
    }
  }
  return null
}

/** Extract user info fetch error for Google OAuth; returns null if not a known error. */
export function buildUserInfoError(err: unknown): OAuthError | null {
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'))
    return { code: 'USER_INFO_FAILED', message: 'Failed to fetch Google user (timeout)' }
  if (err && typeof err === 'object' && 'gUser' in err) {
    const e = err as { gUser: unknown; status?: number }
    return {
      code: 'USER_INFO_FAILED',
      message: 'Failed to fetch Google user',
      status: e.status,
    }
  }
  return null
}
