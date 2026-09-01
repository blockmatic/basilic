import Fastify from 'fastify'
import { afterEach, describe, expect, it } from 'vitest'
import { getTrustedClientIp } from '../src/lib/request.js'

describe('trustProxy', () => {
  const instances: ReturnType<typeof Fastify>[] = []

  afterEach(async () => {
    await Promise.all(instances.splice(0).map(app => app.close()))
  })

  it('ignores X-Forwarded-For when trustProxy is false', async () => {
    const app = Fastify({ trustProxy: false })
    instances.push(app)
    app.get('/ip', async request => ({ ip: getTrustedClientIp(request) }))
    await app.ready()

    const res = await app.inject({
      method: 'GET',
      url: '/ip',
      headers: { 'x-forwarded-for': '203.0.113.1' },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).ip).not.toBe('203.0.113.1')
  })

  it('ignores X-Forwarded-For when trustProxy is a hop count (Fastify 5 fail-closed)', async () => {
    const app = Fastify({ trustProxy: 1 })
    instances.push(app)
    app.get('/ip', async request => ({ ip: getTrustedClientIp(request) }))
    await app.ready()

    const res = await app.inject({
      method: 'GET',
      url: '/ip',
      remoteAddress: '203.0.113.7',
      headers: { 'x-forwarded-for': '9.9.9.9' },
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body).ip).toBe('203.0.113.7')
  })

  it('uses X-Forwarded-For when trustProxy is true', async () => {
    const app = Fastify({ trustProxy: true })
    instances.push(app)
    app.get('/ip', async request => ({ ip: getTrustedClientIp(request) }))
    const address = await app.listen({ port: 0, host: '127.0.0.1' })

    const res = await fetch(`${address}/ip`, {
      headers: { 'x-forwarded-for': '203.0.113.1' },
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ip: '203.0.113.1' })
  })
})
