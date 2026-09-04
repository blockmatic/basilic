import { translateOAuthError } from '@/lib/auth/auth-error-messages'
import { handleOAuthBffGet } from '@/lib/auth/callback-utils'

export async function GET(request: Request) {
  return handleOAuthBffGet({
    request,
    method: 'oauth_google',
    failureMessage: 'oauth_failed_google',
    fallbackMessage: 'Google sign-in failed',
    exchange: ({ client, code, state }) =>
      client.auth.oauth.google.exchange({ body: { code, state }, throwOnError: true }),
    mapError: (raw, body) => translateOAuthError(raw, body, 'google'),
  })
}
