import { createClient } from '@repo/core'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { env } from '@/lib/env'

const client = createClient({ baseUrl: env.NEXT_PUBLIC_API_URL })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const callbackURL = searchParams.get('callbackURL')?.startsWith('/')
    ? searchParams.get('callbackURL')
    : null

  if (!code) redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

  try {
    const response = await client.auth.web3.exchange({ body: { code } })
    const accessToken =
      response && typeof response === 'object' && 'token' in response
        ? (response as { token: string }).token
        : null
    const refreshToken =
      response && typeof response === 'object' && 'refreshToken' in response
        ? (response as { refreshToken: string }).refreshToken
        : null

    if (!accessToken || !refreshToken)
      redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)

    const redirectUrl = callbackURL ?? '/'
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, { token: accessToken, refreshToken })
    return redirectResponse
  } catch {
    redirect(`/auth/login?message=${encodeURIComponent('INVALID_OR_EXPIRED_CODE')}`)
  }
}
