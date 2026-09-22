import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@repo/db', () => ({
  getValidSession: vi.fn(async ({ sid, userId }: { sid: string; userId: string }) => {
    if (sid === 'sid-a' && userId === 'user-a')
      return { session: { id: sid, userId }, user: { id: userId } }
    return null
  }),
}))

function signJwt({
  payload,
  secret,
}: {
  payload: Record<string, unknown>
  secret: string
}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

const secret = 'default-jwt-secret-min-32-chars-for-dev'
const now = Math.floor(Date.now() / 1000)

describe('basilicAccessJwt', () => {
  it('accepts an access JWT whose session row matches', async () => {
    const { basilicAccessJwt } = await import('./auth.js')
    const token = signJwt({
      secret,
      payload: {
        typ: 'access',
        sub: 'user-a',
        sid: 'sid-a',
        iss: 'api.yourapp.com',
        aud: 'api.yourapp.com',
        iat: now,
        exp: now + 900,
      },
    })
    const auth = basilicAccessJwt()
    const session = await auth(
      new Request('https://agents.basilic.localhost/eve/command/v1/session', {
        headers: { authorization: `Bearer ${token}` },
      }),
    )
    expect(session).toMatchObject({
      principalId: 'user-a',
      principalType: 'user',
      authenticator: 'basilic-jwt',
      attributes: { sessionId: 'sid-a' },
    })
  })

  it('skips refresh JWTs', async () => {
    const { basilicAccessJwt } = await import('./auth.js')
    const token = signJwt({
      secret,
      payload: {
        typ: 'refresh',
        sub: 'user-a',
        sid: 'sid-a',
        iss: 'api.yourapp.com',
        aud: 'api.yourapp.com',
        iat: now,
        exp: now + 900,
      },
    })
    const auth = basilicAccessJwt()
    expect(
      await auth(
        new Request('https://agents.basilic.localhost/eve/command/v1/session', {
          headers: { authorization: `Bearer ${token}` },
        }),
      ),
    ).toBeNull()
  })
})
