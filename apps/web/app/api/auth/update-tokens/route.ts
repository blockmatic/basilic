import { ApiError } from '@repo/core'
import { captureError } from '@repo/error/nextjs/server'
import { logger } from '@repo/utils/logger/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'
import { createBffClient } from '@/lib/auth/bff-client'
import { resolveRequestId } from '@/lib/auth/request-id'

const updateTokensSchema = z.object({ token: z.string(), refreshToken: z.string() })

function getRequestHost(request: Request) {
  const forwarded = request.headers.get('X-Forwarded-Host')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return request.headers.get('Host') ?? undefined
}

function isSameOriginRequest(request: Request) {
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return false

  const origin = request.headers.get('Origin')
  if (!origin) return false

  const host = getRequestHost(request)
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const reqId = resolveRequestId(request.headers)
  if (!isSameOriginRequest(request)) {
    logger.warn({ reqId }, 'update-tokens rejected: cross-origin or missing Origin')
    return new Response(JSON.stringify({ message: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const parsed = updateTokensSchema.safeParse(await request.json())
    if (!parsed.success)
      return new Response(
        JSON.stringify({
          message: parsed.error.issues[0]?.message ?? 'token and refreshToken required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )

    const { token, refreshToken } = parsed.data
    const { client } = createBffClient({ request })

    try {
      const authHeader = 'Authorization'
      await client.auth.session.validateTokens({
        body: { refreshToken },
        headers: { [authHeader]: `Bearer ${token}` },
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logger.warn({ reqId, status: error.status }, 'update-tokens rejected: invalid token pair')
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      captureError({
        code: 'INTERNAL_ERROR',
        error: error instanceof Error ? error : new Error(String(error)),
        label: 'update-tokens Fastify validation failed',
        data: { reqId, status: error instanceof ApiError ? error.status : undefined },
        tags: { app: 'web', module: 'auth', route: '/api/auth/update-tokens' },
      })

      return new Response(JSON.stringify({ message: 'Auth service unavailable' }), {
        status: 502,
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
    captureError({
      error: error instanceof Error ? error : new Error(String(error)),
      label: 'update-tokens failed',
      data: { reqId },
      tags: { app: 'web', module: 'auth', route: '/api/auth/update-tokens' },
    })
    return new Response(
      JSON.stringify({
        message: 'Failed to update tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
