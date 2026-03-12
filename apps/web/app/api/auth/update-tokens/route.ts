import { logger } from '@repo/utils/logger/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { setAuthCookiesOnResponse } from '@/lib/auth/auth-server'

const updateTokensSchema = z.object({ token: z.string(), refreshToken: z.string() })

export async function POST(request: Request) {
  try {
    const parsed = updateTokensSchema.safeParse(await request.json())
    if (!parsed.success)
      return new Response(
        JSON.stringify({
          message: parsed.error.issues[0]?.message ?? 'token and refreshToken required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    setAuthCookiesOnResponse(response, parsed.data)
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
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
