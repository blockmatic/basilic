import { ApiError, createClient } from '@repo/core'
import { logger } from '@repo/utils/logger/server'
import { NextResponse } from 'next/server'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { env } from '@/lib/env'
import type { AuthProxyOptions } from './utils'
import { getRedirectUrl } from './utils'

const client = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
})

export const handleMagicLinkVerify = async ({ request }: Pick<AuthProxyOptions, 'request'>) => {
  const requestUrl = new URL(request.url)
  const callbackURL = requestUrl.searchParams.get('callbackURL')
  const token = requestUrl.searchParams.get('token')

  if (!token) {
    const loginUrl = new URL('/auth/login', new URL(request.url).origin)
    loginUrl.searchParams.set('message', 'INVALID_TOKEN')
    return new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl.toString(),
      },
    })
  }

  try {
    const response = await client.auth.magiclink.verify({ body: { token } })

    // Type guard: client wrapper throws on error, so response is guaranteed to be success response
    if (
      !response ||
      typeof response !== 'object' ||
      !('token' in response) ||
      typeof response.token !== 'string' ||
      !('refreshToken' in response) ||
      typeof response.refreshToken !== 'string'
    ) {
      logger.error(
        {
          response,
          responseType: typeof response,
          hasToken: response && typeof response === 'object' && 'token' in response,
          hasRefreshToken: response && typeof response === 'object' && 'refreshToken' in response,
          tokenType:
            response && typeof response === 'object' && 'token' in response
              ? typeof response.token
              : 'N/A',
          refreshTokenType:
            response && typeof response === 'object' && 'refreshToken' in response
              ? typeof response.refreshToken
              : 'N/A',
        },
        'handleMagicLinkVerify: invalid response structure',
      )
      throw new Error('Invalid response from magic link verification')
    }

    const accessToken = (response as unknown as { token: string; refreshToken: string }).token
    const refreshToken = (response as unknown as { token: string; refreshToken: string })
      .refreshToken

    const { redirectUrl } = getRedirectUrl({ request, callbackURL })
    const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url), 303)
    setAuthCookiesOnResponse(redirectResponse, { token: accessToken, refreshToken })
    return redirectResponse
  } catch (error) {
    logger.error(
      {
        error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        isApiError: error instanceof ApiError,
        url: request.url,
        token: token ? `present (length: ${token.length})` : 'missing',
      },
      'handleMagicLinkVerify: error occurred',
    )

    if (error instanceof ApiError) {
      const errorCode =
        error.status === 401 || error.status === 404 ? 'INVALID_TOKEN' : 'FAILED_VERIFY'
      logger.error(
        {
          status: error.status,
          errorCode,
          errorBody: error.body,
          apiUrl: env.NEXT_PUBLIC_API_URL,
          targetEndpoint: `${env.NEXT_PUBLIC_API_URL}/api/auth/magiclink/verify`,
        },
        'handleMagicLinkVerify: Fastify API error response',
      )
      const loginUrl = new URL('/auth/login', new URL(request.url).origin)
      loginUrl.searchParams.set('message', errorCode)
      return new Response(null, {
        status: 302,
        headers: {
          Location: loginUrl.toString(),
        },
      })
    }

    logger.error(
      {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        url: request.url,
      },
      'handleMagicLinkVerify: unexpected error (non-ApiError)',
    )
    const loginUrl = new URL('/auth/login', new URL(request.url).origin)
    loginUrl.searchParams.set('message', 'FAILED_VERIFY')
    return new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl.toString(),
      },
    })
  }
}
