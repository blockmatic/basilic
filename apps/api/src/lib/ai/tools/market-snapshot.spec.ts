import { describe, expect, it, vi } from 'vitest'
import { loadMarketRows } from './market-snapshot.js'

describe('loadMarketRows abort', () => {
  it('does not complete a live fetch when the signal is already aborted', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    controller.abort()
    const { source } = await loadMarketRows(controller.signal)
    expect(source).toBe('mock')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    vi.unstubAllGlobals()
  })
})
