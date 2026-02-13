import type { TestApp } from './fastify.js'

export async function createAuthenticatedUser(
  app: TestApp,
  overrides?: { email?: string },
): Promise<{ token: string; email: string }> {
  const email = overrides?.email ?? 'test@example.com'
  const requestResponse = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  if (requestResponse.statusCode !== 200) {
    throw new Error(
      `magiclink/request failed: ${requestResponse.statusCode} ${requestResponse.body}`,
    )
  }
  const token = app.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  const verifyResponse = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { token },
  })
  if (verifyResponse.statusCode !== 200) {
    throw new Error(`magiclink/verify failed: ${verifyResponse.statusCode} ${verifyResponse.body}`)
  }
  const body = JSON.parse(verifyResponse.body)
  if (!body.token) throw new Error('No token in verify response')
  return { token: body.token, email }
}
