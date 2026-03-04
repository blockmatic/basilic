import { logger } from '@repo/utils/logger/server'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import type { AuthProxyOptions } from './utils'

export const handleUpdateTokens = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  try {
    const body = await request.json()
    const { token, refreshToken } = body as { token?: string; refreshToken?: string }

    if (typeof token !== 'string' || typeof refreshToken !== 'string') {
      return new Response(JSON.stringify({ message: 'token and refreshToken required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    setAuthCookiesOnResponse(response, { token, refreshToken })
    return response
  } catch (error) {
    logger.error({ error }, 'API auth route: update tokens failed')
    return new Response(
      JSON.stringify({
        message: 'Failed to update tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
