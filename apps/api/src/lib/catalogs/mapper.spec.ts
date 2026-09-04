import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@repo/error/node', () => ({
  captureError: vi.fn(),
}))

const { captureError } = await import('@repo/error/node')
const { sendCatalogError, sendServerCatalogError } = await import('./mapper.js')

describe('catalog error helpers', () => {
  beforeEach(() => {
    vi.mocked(captureError).mockClear()
  })

  it('sendCatalogError does not capture', () => {
    const send = vi.fn().mockReturnValue('sent')
    const reply = { code: vi.fn().mockReturnValue({ send }) }
    sendCatalogError({ reply: reply as never, status: 500, code: 'SERVER_ERROR' })
    expect(captureError).not.toHaveBeenCalled()
    expect(reply.code).toHaveBeenCalledWith(500)
  })

  it('sendServerCatalogError captures once then catalogs', () => {
    const send = vi.fn().mockReturnValue('sent')
    const reply = { code: vi.fn().mockReturnValue({ send }) }
    const request = { log: {}, method: 'GET', url: '/auth/oauth/google/exchange?code=secret' }
    sendServerCatalogError({
      request: request as never,
      reply: reply as never,
      code: 'USER_CREATE_FAILED',
    })
    expect(captureError).toHaveBeenCalledOnce()
    const arg = vi.mocked(captureError).mock.calls[0]?.[0]
    expect(arg).toMatchObject({
      code: 'USER_CREATE_FAILED',
      data: { method: 'GET', url: '/auth/oauth/google/exchange' },
    })
    expect(JSON.stringify(arg)).not.toContain('code=secret')
  })
})
