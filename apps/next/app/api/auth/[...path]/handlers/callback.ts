import { logger } from '@repo/utils/logger'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth-server'
import type { AuthProxyOptions } from './utils'
import { getRedirectUrl } from './utils'

export const handleWeb3Callback = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    const loginUrl = new URL('/login', new URL(request.url).origin)
    loginUrl.searchParams.set('message', 'Invalid request')
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }

  const token =
    typeof body === 'object' && body !== null && 'token' in body
      ? (body as { token: unknown }).token
      : undefined
  const refreshToken =
    typeof body === 'object' && body !== null && 'refreshToken' in body
      ? (body as { refreshToken: unknown }).refreshToken
      : undefined

  if (typeof token !== 'string' || !token || typeof refreshToken !== 'string' || !refreshToken) {
    const loginUrl = new URL('/login', new URL(request.url).origin)
    loginUrl.searchParams.set('message', 'Invalid or missing tokens')
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }

  try {
    const requestUrl = new URL(request.url)
    const callbackURL = requestUrl.searchParams.get('callbackURL')
    const { redirectUrl } = getRedirectUrl({ request, callbackURL })
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, { token, refreshToken })
    return redirectResponse
  } catch (error) {
    logger.error({ error, url: request.url }, 'handleWeb3Callback: error setting cookies')
    const loginUrl = new URL('/login', new URL(request.url).origin)
    loginUrl.searchParams.set('message', 'Failed to complete sign in')
    return new Response(null, {
      status: 302,
      headers: { Location: loginUrl.toString() },
    })
  }
}
