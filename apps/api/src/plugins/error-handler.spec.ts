import Fastify from 'fastify'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@repo/error/node', () => ({
  captureError: vi.fn(),
}))

const { captureError } = await import('@repo/error/node')
const errorHandler = (await import('../plugins/error-handler.js')).default

describe('error-handler', () => {
  it('captures thrown 500 without body or query', async () => {
    vi.mocked(captureError).mockClear()
    const app = Fastify({ logger: false })
    await app.register(errorHandler)
    app.post('/boom', async request => {
      void request.body
      throw new Error('kaboom')
    })
    await app.ready()
    const response = await app.inject({
      method: 'POST',
      url: '/boom?token=secret',
      payload: { password: 'hunter2', prompt: 'do not log me' },
    })
    expect(response.statusCode).toBe(500)
    expect(captureError).toHaveBeenCalledOnce()
    const arg = vi.mocked(captureError).mock.calls[0]?.[0]
    expect(arg).toMatchObject({
      data: { method: 'POST', url: '/boom' },
    })
    const serialized = JSON.stringify(arg)
    expect(serialized).not.toContain('hunter2')
    expect(serialized).not.toContain('do not log me')
    expect(serialized).not.toContain('token=secret')
    await app.close()
  })

  it('returns catalog JSON 404 when Accept is JSON', async () => {
    const app = Fastify({ logger: false })
    await app.register(errorHandler)
    await app.ready()
    const response = await app.inject({
      method: 'GET',
      url: '/missing',
      headers: { accept: 'application/json' },
    })
    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toEqual({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    })
    await app.close()
  })

  it('returns HTML recovery 404 by default', async () => {
    const app = Fastify({ logger: false })
    await app.register(errorHandler)
    await app.ready()
    const response = await app.inject({
      method: 'GET',
      url: '/missing',
    })
    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.body.length).toBeGreaterThanOrEqual(20)
    expect(response.body).toContain('href="/"')
    expect(response.body).toContain('/llms.txt')
    expect(response.body).toContain('/sitemap.xml')
    expect(response.body).toContain('/openapi.json')
    await app.close()
  })

  it('returns markdown recovery 404 when Accept is markdown', async () => {
    const app = Fastify({ logger: false })
    await app.register(errorHandler)
    await app.ready()
    const response = await app.inject({
      method: 'GET',
      url: '/missing',
      headers: { accept: 'text/markdown' },
    })
    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/markdown')
    expect(response.body).toContain('# Not found')
    expect(response.body).toContain('/llms.txt')
    await app.close()
  })
})
