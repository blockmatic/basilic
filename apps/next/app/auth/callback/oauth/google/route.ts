import { ApiError, createClient } from '@repo/core'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { translateOAuthError } from '@/lib/auth/auth-error-messages'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens, getOAuthRedirectTarget } from '@/lib/auth/callback-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state)
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent('missing_params')}`, request.url),
      303,
    )

  const cookieStore = await cookies()
  const { token } = parseAuthCookie(cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value)
  const client = createClient({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    ...(token && {
      getAuthToken: () => token,
      getRefreshToken: () => null,
      onTokensRefreshed: async () => {},
    }),
  })

  try {
    const response = await client.auth.oauth.google.exchange({
      body: { code, state },
      throwOnError: true,
    })
    const tokens = extractTokens(response)
    if (!tokens)
      return NextResponse.redirect(
        new URL(`/auth/login?message=${encodeURIComponent('oauth_failed_google')}`, request.url),
        303,
      )

    const redirectResponse = NextResponse.redirect(
      new URL(getOAuthRedirectTarget(response), request.url),
      303,
    )
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Google sign-in failed'
    const body = error instanceof ApiError ? error.body : undefined
    const errorCode = translateOAuthError(rawMessage, body, 'google')
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(errorCode)}`, request.url),
      303,
    )
  }
}
