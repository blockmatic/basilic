import Fastify from 'fastify'
import { afterEach, describe, expect, it } from 'vitest'
import rateLimitPlugin from './rate-limit.js'

describe('rate-limit plugin', () => {
  let app: ReturnType<typeof Fastify> | undefined

  afterEach(async () => {
    if (app) await app.close()
    app = undefined
  })

  it('sends IETF RateLimit headers and catalog 429 body', async () => {
    app = Fastify({ logger: false })
    await app.register(rateLimitPlugin, { max: 1, timeWindow: 60_000 })
    app.get('/ping', async () => ({ ok: true }))
    await app.ready()

    const first = await app.inject({ method: 'GET', url: '/ping' })
    expect(first.statusCode).toBe(200)

    const response = await app.inject({ method: 'GET', url: '/ping' })
    expect(response.statusCode).toBe(429)
    const body = response.json()
    expect(body.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(body.message).toBe('Rate limit exceeded')
    expect(body.detail).toContain('Maximum 1 requests per 60s')
    expect(body.retryAfter).toBeGreaterThan(0)
    expect(body.retryAfter).toBeLessThanOrEqual(60)
    expect(body.status).toBe(429)
    expect(response.headers['content-type']).toContain('application/json')
    expect(response.headers.vary).toMatch(/Accept/i)

    const headers = response.headers
    expect(String(headers['x-ratelimit-limit'] ?? '')).toBe('1')
    expect(headers['retry-after']).toBeDefined()
    expect(Number(headers['retry-after'])).toBe(body.retryAfter)
    expect(headers.ratelimit ?? headers['rate-limit']).toMatch(/"default";r=/)
    expect(headers['ratelimit-policy'] ?? headers['rate-limit-policy']).toMatch(
      /"default";q=1;w=60/,
    )
  })

  it('negotiates problem+json on 429 when Accept prefers it', async () => {
    app = Fastify({ logger: false })
    await app.register(rateLimitPlugin, { max: 1, timeWindow: 60_000 })
    app.get('/ping', async () => ({ ok: true }))
    await app.ready()

    await app.inject({ method: 'GET', url: '/ping' })
    const response = await app.inject({
      method: 'GET',
      url: '/ping',
      headers: { accept: 'application/problem+json' },
    })
    expect(response.statusCode).toBe(429)
    expect(response.headers['content-type']).toContain('application/problem+json')
  })
})
