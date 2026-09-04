import type { NextResponse } from 'next/server'
import { translateOAuthError } from '@/lib/auth/auth-error-messages'
import { handleOAuthBffGet } from '@/lib/auth/callback-utils'

export async function GET(request: Request): Promise<NextResponse> {
  return handleOAuthBffGet({
    request,
    method: 'oauth_github',
    failureMessage: 'oauth_failed',
    fallbackMessage: 'GitHub sign-in failed',
    exchange: ({ client, code, state }) =>
      client.auth.oauth.github.exchange({ body: { code, state }, throwOnError: true }),
    mapError: (raw, body) => translateOAuthError(raw, body),
  })
}
