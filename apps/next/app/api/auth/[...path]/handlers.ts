import { logger } from '@repo/utils/logger'
import {
  clearServerAuthToken,
  clearServerRefreshToken,
  getServerAuthToken,
} from '@/lib/auth-server'
import { handleWeb3Callback } from './handlers/callback'
import { handleMagicLinkVerify } from './handlers/magic-link'
import { handleGetSession, handleUpdateTokens } from './handlers/session'
import type { AuthProxyOptions } from './handlers/utils'
import { buildFastifyUrl, getForwardedHeaders, getRequestBody } from './handlers/utils'

export const proxyRequest = async ({ pathSegments, request }: AuthProxyOptions) => {
  const { path, targetUrl } = buildFastifyUrl({ pathSegments, request })

  if (path === 'callback') {
    return handleWeb3Callback({ request })
  }

  if (path === 'magiclink/verify') {
    return handleMagicLinkVerify({ request })
  }

  if (path === 'get-session') {
    return handleGetSession()
  }

  if (path === 'update-tokens') {
    return handleUpdateTokens({ request })
  }

  if (path === 'session/user') {
    const { token } = await getServerAuthToken()
    if (!token) {
      return new Response(
        JSON.stringify({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const { headers } = getForwardedHeaders({ request, token })
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    })

    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        responseHeaders.set(key, value)
      }
    })

    const responseBody = await response.text()
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  }

  const { token } = await getServerAuthToken()
  const isSignOut = path === 'sign-out'
  if (isSignOut) {
    await clearServerAuthToken()
    await clearServerRefreshToken()
  }

  const { headers } = getForwardedHeaders({ request, token })
  const { body } = await getRequestBody({ request })

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        responseHeaders.set(key, value)
      }
    })

    const prefersHtml = request.headers.get('accept')?.includes('text/html')
    if (isSignOut && request.method === 'GET' && prefersHtml) {
      const redirectUrl = new URL('/', request.url)
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl.toString(),
        },
      })
    }

    const responseBody = await response.text()
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    logger.error({ error, path, targetUrl }, 'API auth route: proxy request failed')
    return new Response(
      JSON.stringify({
        message: 'Failed to connect to authentication service',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 502,
        statusText: 'Bad Gateway',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
