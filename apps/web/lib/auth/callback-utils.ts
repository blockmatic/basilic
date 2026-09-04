import { ApiError } from '@repo/core'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { capture, type SignInMethod } from '@/lib/analytics'
import { env } from '@/lib/env'
import { authCookieSchema } from './auth-schemas'
import { setAuthCookiesOnResponse } from './auth-server'
import { createBffClient, logAuthBffFailure } from './bff-client'
import { parseAuthCookie } from './parse-auth-cookie'

type BffClient = ReturnType<typeof createBffClient>['client']

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
  method,
}: {
  request: Request
  response: unknown
  failureMessage: string
  method: SignInMethod
}): NextResponse {
  const tokens = extractTokens(response)
  if (!tokens) {
    capture({ name: 'auth_failed', method, errorCode: failureMessage })
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(failureMessage)}`, request.url),
      303,
    )
  }

  const redirectResponse = NextResponse.redirect(
    new URL(getOAuthRedirectTarget(response), request.url),
    303,
  )
  setAuthCookiesOnResponse(redirectResponse, tokens)
  capture({ name: 'auth_succeeded', method })
  return redirectResponse
}

export async function handleOAuthBffGet({
  request,
  method,
  failureMessage,
  fallbackMessage,
  exchange,
  mapError,
}: {
  request: Request
  method: SignInMethod
  failureMessage: string
  fallbackMessage: string
  exchange: (args: { client: BffClient; code: string; state: string }) => Promise<unknown>
  mapError: (raw: string, body?: unknown) => string
}): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  if (!code || !state) {
    capture({ name: 'auth_failed', method, errorCode: 'missing_params' })
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent('missing_params')}`, request.url),
      303,
    )
  }

  const cookieStore = await cookies()
  const { token } = parseAuthCookie(cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value)
  const { client, reqId } = createBffClient({ request, token })

  try {
    const response = await exchange({ client, code, state })
    return completeOAuthCallback({ request, response, failureMessage, method })
  } catch (error) {
    logAuthBffFailure({ error, reqId, method })
    const rawMessage = error instanceof Error ? error.message : fallbackMessage
    const body = error instanceof ApiError ? error.body : undefined
    const errorCode = mapError(rawMessage, body)
    capture({ name: 'auth_failed', method, errorCode })
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(errorCode)}`, request.url),
      303,
    )
  }
}
