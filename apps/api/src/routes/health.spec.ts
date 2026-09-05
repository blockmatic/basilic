import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'
import { getDb } from '../db/index.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('GET /health', () => {
  let fastify: TestApp

  beforeAll(async () => {
    await setupGroupDatabase()
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    if (fastify) await fastify.close()
    await cleanupGroupDatabase()
  })

  it('should return 200 with ok and dbReady fields', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    const data = JSON.parse(response.body)
    expect(data).toMatchObject({
      ok: true,
      dbReady: true,
    })
  })

  it('should return 503 when the database probe fails', async () => {
    await getDb()
    const pglite = (
      globalThis as { __testPgliteInstance?: { query: (...args: unknown[]) => Promise<unknown> } }
    ).__testPgliteInstance
    if (!pglite) throw new Error('expected the shared test PGLite instance')
    const query = pglite.query.bind(pglite)
    pglite.query = async () => {
      throw new Error('select 1 failed')
    }
    try {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health',
      })
      expect(response.statusCode).toBe(503)
      expect(JSON.parse(response.body)).toMatchObject({ ok: false, dbReady: false })
    } finally {
      pglite.query = query
    }
  })

  it('should include security headers but not HSTS in non-production', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('DENY')
    expect(response.headers['strict-transport-security']).toBeUndefined()
  })
})
