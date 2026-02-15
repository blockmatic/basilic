import type { TestApp } from './fastify.js'

export async function getSessionToken(app: TestApp, email: string): Promise<string> {
  const requestRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/request',
    payload: { email, callbackUrl: 'https://example.com/callback' },
  })
  if (requestRes.statusCode < 200 || requestRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/request failed: url=/auth/magiclink/request status=${requestRes.statusCode} body=${requestRes.body}`,
    )
  }
  const token = app.fakeEmail?.extractToken()
  if (!token) throw new Error('No token in fake email')
  const verifyRes = await app.inject({
    method: 'POST',
    url: '/auth/magiclink/verify',
    payload: { token },
  })
  if (verifyRes.statusCode < 200 || verifyRes.statusCode >= 300) {
    throw new Error(
      `auth/magiclink/verify failed: url=/auth/magiclink/verify status=${verifyRes.statusCode} body=${verifyRes.body}`,
    )
  }
  const { token: jwt } = JSON.parse(verifyRes.body) as { token: string }
  return jwt
}

export async function createAuthenticatedUser(
  app: TestApp,
  overrides?: { email?: string },
): Promise<{ token: string; email: string }> {
  const email = overrides?.email ?? 'test@example.com'
  const token = await getSessionToken(app, email)
  return { token, email }
}
