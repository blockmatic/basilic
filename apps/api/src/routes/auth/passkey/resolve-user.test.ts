import { describe, expect, it } from 'vitest'
import { getOrCreateSession, insertTestPasskey } from '../../../../test/utils/auth-helper.js'
import { fastify } from '../passkey.spec.js'

describe('POST /auth/passkey/resolve-user', () => {
  it('should return 400 for userHandle with no matching passkey user', async () => {
    const userHandle = Buffer.from('00000000-0000-0000-0000-000000000099', 'utf-8').toString(
      'base64url',
    )
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/resolve-user',
      payload: { userHandle },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({ code: 'INVALID_USER_HANDLE' })
  })

  it('should return masked email for valid userHandle', async () => {
    const jwt = await getOrCreateSession(fastify, 'resolve-user@test.ai', { clearBefore: true })
    await insertTestPasskey(fastify, jwt)

    const userRes = await fastify.inject({
      method: 'GET',
      url: '/auth/session/user',
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const userId = (JSON.parse(userRes.body) as { user: { id: string } }).user.id
    const userHandle = Buffer.from(userId, 'utf-8').toString('base64url')

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/resolve-user',
      payload: { userHandle },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json() as { maskedIdentifier: string }
    expect(body.maskedIdentifier).toContain('@')
    expect(body.maskedIdentifier).not.toBe('resolve-user@test.ai')
  })
})
