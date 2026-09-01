import { NextResponse } from 'next/server'
import { authCookieSchema } from './auth-schemas'
import { setAuthCookiesOnResponse } from './auth-server'

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

export function completeOAuthCallback({
  request,
  response,
  failureMessage,
}: {
  request: Request
  response: unknown
  failureMessage: string
}): NextResponse {
  const tokens = extractTokens(response)
  if (!tokens)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(failureMessage)}`, request.url),
      303,
    )

  const redirectResponse = NextResponse.redirect(
    new URL(getOAuthRedirectTarget(response), request.url),
    303,
  )
  setAuthCookiesOnResponse(redirectResponse, tokens)
  return redirectResponse
}
