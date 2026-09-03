import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { encryptCallbackTokens } from '../../../db/callback-tokens.js'
import { getDb } from '../../../db/index.js'
import { web3Callback } from '../../../db/schema/index.js'
import { generateToken, hashToken } from '../../../lib/jwt.js'
import { fastify } from './web3.spec.js'

describe('POST /auth/web3/exchange', () => {
  it('should return tokens for valid code and delete row', async () => {
    const code = generateToken()
    const codeHash = hashToken(code)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const encrypted = encryptCallbackTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })

    const db = await getDb()
    await db.insert(web3Callback).values({
      id: randomUUID(),
      codeHash,
      accessToken: encrypted.accessToken,
      refreshToken: encrypted.refreshToken,
      expiresAt,
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/exchange',
      payload: { code },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toMatchObject({ token: 'test-access-token', refreshToken: 'test-refresh-token' })

    const row = await db.select().from(web3Callback).where(eq(web3Callback.codeHash, codeHash))
    expect(row).toHaveLength(0)
  })

  it('should return 401 for invalid code', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/exchange',
      payload: { code: 'invalid-code' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json()).toMatchObject({
      code: 'INVALID_OR_EXPIRED_CODE',
      message: 'Invalid or expired code',
    })
  })

  it('should return 401 for expired code', async () => {
    const code = generateToken()
    const codeHash = hashToken(code)
    const expiresAt = new Date(Date.now() - 60 * 1000)

    const db = await getDb()
    const encrypted = encryptCallbackTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })
    await db.insert(web3Callback).values({
      id: randomUUID(),
      codeHash,
      accessToken: encrypted.accessToken,
      refreshToken: encrypted.refreshToken,
      expiresAt,
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/exchange',
      payload: { code },
    })

    expect(res.statusCode).toBe(401)
  })

  it('should return 400 for empty code', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/web3/exchange',
      payload: { code: '   ' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'MISSING_CODE',
      message: 'Code is required',
    })
  })
})
