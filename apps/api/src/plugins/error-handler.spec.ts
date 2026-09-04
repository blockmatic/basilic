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
})
