import { ApiError, createClient } from '@repo/core'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { extractTokens } from '@/lib/auth/callback-utils'
import { parseAuthCookie } from '@/lib/auth/parse-auth-cookie'
import { env } from '@/lib/env'

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sixDigitCode = /^\d{6}$/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const verificationId = searchParams.get('verificationId')

  if (!token || !verificationId || !sixDigitCode.test(token) || !uuidLike.test(verificationId))
    return NextResponse.redirect(new URL('/settings?error=invalid', request.url), 303)

  const cookieStore = await cookies()
  const { token: authToken, refreshToken } = parseAuthCookie(
    cookieStore.get(env.NEXT_PUBLIC_AUTH_COOKIE_NAME)?.value,
  )

  if (!authToken) {
    const callbackUrl = new URL(request.url)
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', callbackUrl.pathname + callbackUrl.search)
    return NextResponse.redirect(redirectUrl, 303)
  }

  let refreshedToken = authToken
  let refreshedRefreshToken = refreshToken

  const authedClient = createClient({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    getAuthToken: () => refreshedToken,
    getRefreshToken: () => refreshedRefreshToken,
    onTokensRefreshed: async ({ token, refreshToken: rt }) => {
      refreshedToken = token
      refreshedRefreshToken = rt
    },
  })

  try {
    const response = await authedClient.account.email.change.verify({
      body: { token, verificationId },
      throwOnError: true,
    })
    const tokens = extractTokens(response)
    if (!tokens)
      return NextResponse.redirect(new URL('/settings?error=verify_failed', request.url), 303)

    const redirectResponse = NextResponse.redirect(
      new URL('/settings?email_changed=ok', request.url),
      303,
    )
    setAuthCookiesOnResponse(redirectResponse, tokens)
    return redirectResponse
  } catch (error) {
    const code =
      error instanceof ApiError
        ? error.status === 401
          ? 'invalid_token'
          : 'verify_failed'
        : 'verify_failed'
    return NextResponse.redirect(new URL(`/settings?error=${code}`, request.url), 303)
  }
}
