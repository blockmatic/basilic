import { isValidRequestId } from '@repo/utils/logger/types'
import Fastify from 'fastify'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanupGroupDatabase, setupGroupDatabase } from '../../test/utils/db-setup.js'
import type { TestApp } from '../../test/utils/fastify.js'
import { buildTestApp } from '../../test/utils/fastify.js'
import { createApiLoggerOptions } from './http-logging.js'

vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})

describe('x-request-id', () => {
  let fastify: TestApp

  beforeAll(async () => {
    await setupGroupDatabase()
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    if (fastify) await fastify.close()
    await cleanupGroupDatabase()
  })

  it('generates and echoes a request id', async () => {
    const response = await fastify.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    const id = response.headers['x-request-id']
    expect(typeof id).toBe('string')
    expect(isValidRequestId(String(id))).toBe(true)
  })

  it('uses a valid incoming x-request-id', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-request-id': 'client-req-1' },
    })
    expect(response.headers['x-request-id']).toBe('client-req-1')
  })

  it('rejects an invalid incoming x-request-id', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-request-id': 'not a valid id' },
    })
    const id = String(response.headers['x-request-id'])
    expect(id).not.toBe('not a valid id')
    expect(isValidRequestId(id)).toBe(true)
  })
})

describe('reqId log field', () => {
  it('sets request.id as reqId and logs path without query', async () => {
    const lines: string[] = []
    const opts = createApiLoggerOptions({ level: 'info' })
    const app = Fastify({
      ...opts,
      logger: { ...opts.logger, stream: { write: (chunk: string) => lines.push(chunk) } },
    })
    app.addHook('onRequest', async (request, reply) => {
      reply.header('x-request-id', request.id)
    })
    app.get('/probe', async request => ({ id: request.id }))
    await app.ready()
    const response = await app.inject({
      method: 'GET',
      url: '/probe?token=secret',
      headers: { 'x-request-id': 'join-key-1' },
    })
    expect(response.json()).toEqual({ id: 'join-key-1' })
    expect(response.headers['x-request-id']).toBe('join-key-1')
    const parsed = lines.map(line => JSON.parse(line) as { reqId?: string; req?: { url?: string } })
    expect(parsed.some(entry => entry.reqId === 'join-key-1')).toBe(true)
    expect(lines.join('')).not.toContain('token=secret')
    expect(parsed.some(entry => entry.req?.url === '/probe')).toBe(true)
    await app.close()
  })
})
