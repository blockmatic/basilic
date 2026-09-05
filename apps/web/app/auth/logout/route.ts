import { NextResponse } from 'next/server'
import {
  clearAuthCookiesOnResponse,
  getServerAuthCookie,
  refreshTokensWithRefreshToken,
} from '@/lib/auth/auth-server'
import { createBffClient, logAuthBffFailure } from '@/lib/auth/bff-client'
import { isTokenExpired } from '@/lib/auth/jwt-utils'
import { resolveRequestId } from '@/lib/auth/request-id'

export async function GET(request: Request): Promise<NextResponse> {
  const { token, refreshToken } = await getServerAuthCookie()
  let accessToken = token

  if (accessToken && isTokenExpired({ token: accessToken }) && refreshToken) {
    const reqId = resolveRequestId(request.headers)
    const result = await refreshTokensWithRefreshToken({ refreshToken, request, reqId })
    if (result.status === 'ok') accessToken = result.tokens.token
    else accessToken = null
  }

  if (accessToken) {
    const { client, reqId } = createBffClient({ request, token: accessToken })
    try {
      await client.auth.session.logout({
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch (error) {
      logAuthBffFailure({ error, reqId, method: 'logout' })
    }
  }

  const response = NextResponse.redirect(new URL('/', request.url), 303)
  clearAuthCookiesOnResponse(response)
  return response
}
