import { createClient } from '@repo/core'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

function mapAuthError(raw: string): string {
  const known: Record<string, string> = {
    'Invalid OAuth callback - missing code or state': 'missing_params',
    'Invalid or expired state': 'INVALID_STATE',
    'State has expired': 'EXPIRED_STATE',
    'Failed to exchange code for token': 'TOKEN_EXCHANGE_FAILED',
    'Failed to fetch GitHub user': 'FETCH_USER_FAILED',
    'Could not retrieve email from GitHub': 'EMAIL_REQUIRED',
    'GitHub OAuth is not configured': 'OAUTH_NOT_CONFIGURED',
    'GitHub sign-in failed': 'oauth_failed',
  }
  return known[raw] ?? 'oauth_failed'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) redirect(`/auth/login?message=${encodeURIComponent('missing_params')}`)

  try {
    const response = await client.auth.oauth.github.exchange({ body: { code, state } })
    const accessToken =
      response && typeof response === 'object' && 'token' in response
        ? (response as { token: string }).token
        : null
    const refreshToken =
      response && typeof response === 'object' && 'refreshToken' in response
        ? (response as { refreshToken: string }).refreshToken
        : null

    if (!accessToken || !refreshToken)
      redirect(`/auth/login?message=${encodeURIComponent('oauth_failed')}`)

    const redirectResponse = NextResponse.redirect(new URL('/', request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, { token: accessToken, refreshToken })
    return redirectResponse
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'GitHub sign-in failed'
    const code = mapAuthError(rawMessage)
    redirect(`/auth/login?message=${encodeURIComponent(code)}`)
  }
}
