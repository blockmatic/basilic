import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../../test/utils/db-setup.js'
import type { TestApp } from '../../../test/utils/fastify.js'
import { buildTestApp } from '../../../test/utils/fastify.js'
import { getDb } from '../../db/index.js'
import { encryptPasskeyTokens } from '../../db/passkey-callback.js'
import { passkeyCallback } from '../../db/schema/index.js'
import { generateToken, hashToken } from '../../lib/jwt.js'

let fastify: TestApp

beforeAll(async () => {
  await setupGroupDatabase()
  fastify = await buildTestApp()
})

afterAll(async () => {
  if (fastify) await fastify.close()
  await cleanupGroupDatabase()
})

const minimalAssertion = {
  id: 'fake',
  rawId: 'fake',
  response: {
    clientDataJSON: 'fake',
    authenticatorData: 'fake',
    signature: 'fake',
  },
  type: 'public-key' as const,
}

describe('POST /auth/passkey/start', () => {
  it('should return 400 for missing Origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
    })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'INVALID_ORIGIN',
      message: 'Invalid or missing Origin header',
    })
  })

  it('should return 400 for invalid Origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'javascript:alert(1)' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return 400 for disallowed origin', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://evil.example' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return 200 with options and sessionId when Origin is valid', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toHaveProperty('options')
    expect(body.options).toHaveProperty('challenge')
    expect(body.sessionId).toBeDefined()
    expect(typeof body.sessionId).toBe('string')
    expect(body.sessionId.length).toBeGreaterThan(0)
  })
})

describe('POST /auth/passkey/verify', () => {
  it('should return 400 when sessionId is missing', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: { assertion: minimalAssertion },
    })
    expect(res.statusCode).toBe(400)
    const body = res.json()
    expect(body).toMatchObject({
      code: expect.stringMatching(/BAD_REQUEST|FST_ERR_VALIDATION|VALIDATION/),
      message: expect.any(String),
    })
  })

  it('should return 401 when sessionId does not match any challenge', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        assertion: minimalAssertion,
        sessionId: 'non-existent-session-id',
      },
    })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toMatchObject({
      code: 'EXPIRED_CHALLENGE',
      message: 'Challenge expired or not found',
    })
  })

  it('should return 400 for invalid callbackUrl', async () => {
    const startRes = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/start',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(startRes.statusCode).toBe(200)
    const { sessionId } = startRes.json() as { sessionId: string }
    expect(sessionId).toBeDefined()

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/verify',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        assertion: minimalAssertion,
        sessionId,
        callbackUrl: 'javascript:alert(1)',
      },
    })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'INVALID_CALLBACK_URL',
      message: 'Callback URL origin is not allowed',
    })
  })
})

describe('POST /auth/passkey/exchange', () => {
  it('should return tokens for valid code and delete row', async () => {
    const code = generateToken()
    const codeHash = hashToken(code)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    const encrypted = encryptPasskeyTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })

    const db = await getDb()
    await db.insert(passkeyCallback).values({
      id: randomUUID(),
      codeHash,
      accessToken: encrypted.accessToken,
      refreshToken: encrypted.refreshToken,
      callbackOrigin: '',
      expiresAt,
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/exchange',
      payload: { code },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toMatchObject({ token: 'test-access-token', refreshToken: 'test-refresh-token' })

    const row = await db
      .select()
      .from(passkeyCallback)
      .where(eq(passkeyCallback.codeHash, codeHash))
    expect(row).toHaveLength(0)
  })

  it('should return 401 for invalid code', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/exchange',
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
    const encrypted = encryptPasskeyTokens({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })

    const db = await getDb()
    await db.insert(passkeyCallback).values({
      id: randomUUID(),
      codeHash,
      accessToken: encrypted.accessToken,
      refreshToken: encrypted.refreshToken,
      callbackOrigin: '',
      expiresAt,
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/exchange',
      payload: { code },
    })

    expect(res.statusCode).toBe(401)
  })

  it('should return 400 for empty code', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/auth/passkey/exchange',
      payload: { code: '   ' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      code: 'MISSING_CODE',
      message: 'code is required',
    })
  })
})
