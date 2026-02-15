import { logger } from '@repo/utils/logger/server'
import {
  getServerAuthToken,
  getServerRefreshToken,
  setServerAuthToken,
  setServerRefreshToken,
} from '@/lib/auth-server'
import type { AuthProxyOptions } from './utils'

export const handleGetSession = async () => {
  const { token } = await getServerAuthToken()
  const { refreshToken } = await getServerRefreshToken()

  return new Response(
    JSON.stringify({
      token: token ?? null,
      refreshToken: refreshToken ?? null,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export const handleUpdateTokens = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  try {
    const body = await request.json()
    const { token, refreshToken } = body as { token?: string; refreshToken?: string }

    if (token && typeof token === 'string') {
      await setServerAuthToken({ token })
    }

    if (refreshToken && typeof refreshToken === 'string') {
      await setServerRefreshToken({ refreshToken })
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
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
