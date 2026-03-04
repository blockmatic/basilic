import { ApiError, createClient } from '@repo/core'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const callbackURL = searchParams.get('callbackURL')?.startsWith('/')
    ? searchParams.get('callbackURL')
    : null

  if (!token) {
    redirect(`/auth/login?message=${encodeURIComponent('INVALID_TOKEN')}`)
  }

  try {
    const response = await client.auth.magiclink.verify({ body: { token } })
    const accessToken =
      response && typeof response === 'object' && 'token' in response
        ? (response as { token: string }).token
        : null
    const refreshToken =
      response && typeof response === 'object' && 'refreshToken' in response
        ? (response as { refreshToken: string }).refreshToken
        : null

    if (!accessToken || !refreshToken) {
      redirect(`/auth/login?message=${encodeURIComponent('FAILED_VERIFY')}`)
    }

    const redirectUrl = callbackURL ?? '/'
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, { token: accessToken, refreshToken })
    return redirectResponse
  } catch (error) {
    const code =
      error instanceof ApiError
        ? error.status === 401
          ? 'INVALID_TOKEN'
          : 'FAILED_VERIFY'
        : 'FAILED_VERIFY'
    redirect(`/auth/login?message=${encodeURIComponent(code)}`)
  }
}
