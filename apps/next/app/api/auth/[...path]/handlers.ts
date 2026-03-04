import { handleUpdateTokens } from './handlers/session'
import { handleTestSetSession } from './handlers/test-set-session'
import type { AuthProxyOptions } from './handlers/utils'

export const proxyRequest = async ({ pathSegments, request }: AuthProxyOptions) => {
  const path = pathSegments.join('/')

  if (path === 'test-set-session') {
    return handleTestSetSession({ request })
  }

  if (path === 'update-tokens') {
    return handleUpdateTokens({ request })
  }

  return new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'Auth route not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}
