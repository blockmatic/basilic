import { describe, expect, it } from 'vitest'
import {
  getLinkEmailToken,
  getOrCreateSession,
  getWeb3Session,
} from '../../../../../test/utils/auth-helper.js'
import { fastify } from '../../account.spec.js'

describe('POST /account/link/email/verify', () => {
  it('should return 401 without Bearer token', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      payload: { token: 'any-token' },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should return EMAIL_ALREADY_SET when user already has email', async () => {
    const jwt = await getOrCreateSession(fastify, 'verify-already-set@test.ai', {
      clearBefore: true,
    })
    const db = await (await import('../../../../db/index.js')).getDb()
    const { verification } = await import('../../../../db/schema/index.js')
    const { hashToken } = await import('../../../../lib/jwt.js')
    const { randomUUID } = await import('node:crypto')

    const linkToken = `manual-link-token-${randomUUID().slice(0, 8)}`
    const userId = JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString())
      .sub as string

    await db.insert(verification).values({
      id: randomUUID(),
      type: 'link_email',
      identifier: `${userId}:blocked@test.ai`,
      value: hashToken(linkToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: linkToken },
    })
    expect(response.statusCode).toBe(409)
    expect(JSON.parse(response.body).code).toBe('EMAIL_ALREADY_SET')
  })

  it('should verify link token for web3-only user and return new JWTs', async () => {
    const jwt = await getWeb3Session(fastify, { accountIndex: 1 })
    const linkToken = await getLinkEmailToken(fastify, jwt, 'linked-web3@test.ai')

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: linkToken },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('refreshToken')

    const db = await (await import('../../../../db/index.js')).getDb()
    const { users } = await import('../../../../db/schema/index.js')
    const { eq } = await import('drizzle-orm')
    const [user] = await db.select().from(users).where(eq(users.email, 'linked-web3@test.ai'))
    expect(user).toBeDefined()
    expect(user?.emailVerified).toBe(true)
  })

  it('should return EXPIRED_TOKEN for expired token', async () => {
    const jwt = await getWeb3Session(fastify, { accountIndex: 2 })
    const db = await (await import('../../../../db/index.js')).getDb()
    const { verification } = await import('../../../../db/schema/index.js')
    const { hashToken } = await import('../../../../lib/jwt.js')
    const { randomUUID } = await import('node:crypto')

    const expiredToken = `expired-test-token-${randomUUID().slice(0, 8)}`
    const tokenHash = hashToken(expiredToken)
    const userId = JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString())
      .sub as string

    await db.insert(verification).values({
      id: randomUUID(),
      type: 'link_email',
      identifier: `${userId}:expired@test.ai`,
      value: tokenHash,
      expiresAt: new Date(Date.now() - 60 * 1000),
    })

    const response = await fastify.inject({
      method: 'POST',
      url: '/account/link/email/verify',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { token: expiredToken },
    })
    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('EXPIRED_TOKEN')
  })
})
