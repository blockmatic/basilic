import { NextResponse } from 'next/server'
import { refreshTokensFromCookie, setAuthCookiesOnResponse } from '@/lib/auth/auth-server'

export async function POST() {
  const tokens = await refreshTokensFromCookie()

  if (!tokens) {
    return new NextResponse(
      JSON.stringify({ code: 'UNAUTHORIZED', message: 'No valid refresh token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const response = new NextResponse(null, { status: 200 })
  setAuthCookiesOnResponse(response, tokens)
  return response
}
