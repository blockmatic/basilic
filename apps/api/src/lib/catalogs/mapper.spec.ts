import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@repo/error/node', () => ({
  captureError: vi.fn(),
}))

const { captureError } = await import('@repo/error/node')
const { sendCatalogError, sendServerCatalogError } = await import('./mapper.js')

function mockReply({ accept }: { accept?: string } = {}) {
  const reply: {
    request: { headers: { accept?: string } }
    header: ReturnType<typeof vi.fn>
    type: ReturnType<typeof vi.fn>
    code: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
  } = {
    request: { headers: accept ? { accept } : {} },
    header: vi.fn(),
    type: vi.fn(),
    code: vi.fn(),
    send: vi.fn(),
  }
  reply.header.mockReturnValue(reply)
  reply.type.mockReturnValue(reply)
  reply.code.mockReturnValue(reply)
  reply.send.mockReturnValue(reply)
  return reply
}

describe('catalog error helpers', () => {
  beforeEach(() => {
    vi.mocked(captureError).mockClear()
  })

  it('sendCatalogError does not capture and sends RFC 9457 fields', () => {
    const reply = mockReply()
    sendCatalogError({ reply: reply as never, status: 500, code: 'SERVER_ERROR' })
    expect(captureError).not.toHaveBeenCalled()
    expect(reply.code).toHaveBeenCalledWith(500)
    expect(reply.type).toHaveBeenCalledWith('application/json')
    expect(reply.header).toHaveBeenCalledWith('Vary', 'Accept')
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SERVER_ERROR',
        message: expect.any(String),
        status: 500,
        type: expect.stringContaining('#SERVER_ERROR'),
        title: expect.any(String),
        detail: expect.any(String),
      }),
    )
  })

  it('sendCatalogError uses problem+json when Accept prefers it', () => {
    const reply = mockReply({ accept: 'application/problem+json' })
    sendCatalogError({ reply: reply as never, status: 401, code: 'UNAUTHORIZED' })
    expect(reply.type).toHaveBeenCalledWith('application/problem+json')
  })

  it('sendServerCatalogError captures once then catalogs', () => {
    const reply = mockReply()
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
