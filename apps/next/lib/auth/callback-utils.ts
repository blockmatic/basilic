import { authCookieSchema } from './auth-schemas'

export function extractTokens(response: unknown): { token: string; refreshToken: string } | null {
  const parsed = authCookieSchema.safeParse(response)
  return parsed.success ? parsed.data : null
}

/** Extract redirectTo from OAuth exchange response when present (link mode). */
export function getOAuthRedirectTarget(response: unknown, fallback = '/'): string {
  if (response && typeof response === 'object' && 'redirectTo' in response) {
    const v = (response as { redirectTo?: unknown }).redirectTo
    if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//')) return v
  }
  return fallback
}
