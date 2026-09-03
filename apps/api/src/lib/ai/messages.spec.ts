import { DownloadError } from 'ai'
import { describe, expect, it, vi } from 'vitest'
import { denyRemoteChatFileDownload } from './download.js'
import { denyRemoteChatFileDownload as denyRemoteChatFileDownloadExport } from './index.js'
import { isAllowedChatFileUrl, resolveMessages } from './messages.js'

const expectRemoteUrlRejected = async (url: string) => {
  try {
    await denyRemoteChatFileDownload([{ url: new URL(url) }])
    expect.fail('expected remote URL to be rejected')
  } catch (error) {
    expect(error).toBeInstanceOf(DownloadError)
    expect((error as Error).message).toContain('Remote file URLs are not allowed')
  }
}

describe('isAllowedChatFileUrl', () => {
  it('allows data: URLs', () => {
    expect(isAllowedChatFileUrl({ url: 'data:image/png;base64,abc' })).toBe(true)
  })

  it('rejects http loopback', () => {
    expect(isAllowedChatFileUrl({ url: 'http://127.0.0.1/' })).toBe(false)
  })

  it('rejects cloud metadata endpoint', () => {
    expect(isAllowedChatFileUrl({ url: 'http://169.254.169.254/' })).toBe(false)
  })

  it('rejects https remote URLs', () => {
    expect(isAllowedChatFileUrl({ url: 'https://example.com/x.png' })).toBe(false)
  })

  it('rejects file: URLs', () => {
    expect(isAllowedChatFileUrl({ url: 'file:///etc/passwd' })).toBe(false)
  })

  it('rejects unparseable URLs', () => {
    expect(isAllowedChatFileUrl({ url: 'not-a-valid-file-url' })).toBe(false)
  })
})

describe('resolveMessages', () => {
  const emptyTools = {}

  it('rejects https file URL in UIMessage', async () => {
    const result = await resolveMessages(
      [
        {
          role: 'user',
          parts: [{ type: 'file', mediaType: 'image/png', url: 'https://example.com/x.png' }],
        },
      ],
      emptyTools,
    )
    expect(result).toEqual({
      ok: false,
      message: 'Invalid request: file URL must be a data: URL',
    })
  })

  it('rejects http loopback file URL in UIMessage', async () => {
    const result = await resolveMessages(
      [
        {
          role: 'user',
          parts: [{ type: 'file', mediaType: 'image/png', url: 'http://127.0.0.1/' }],
        },
      ],
      emptyTools,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('data:')
  })

  it('rejects file: URL in UIMessage', async () => {
    const result = await resolveMessages(
      [
        {
          role: 'user',
          parts: [{ type: 'file', mediaType: 'text/plain', url: 'file:///etc/passwd' }],
        },
      ],
      emptyTools,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('data:')
  })

  it('accepts valid data: file URL in UIMessage', async () => {
    const result = await resolveMessages(
      [
        {
          role: 'user',
          parts: [{ type: 'file', mediaType: 'image/png', url: 'data:image/png;base64,abc' }],
        },
      ],
      emptyTools,
    )
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.messages.length).toBeGreaterThan(0)
  })
})

describe('denyRemoteChatFileDownload', () => {
  it('returns null for data: URLs', async () => {
    const results = await denyRemoteChatFileDownload([
      { url: new URL('data:image/png;base64,abc') },
    ])
    expect(results).toEqual([null])
  })

  it('throws DownloadError for https URLs', async () => {
    await expectRemoteUrlRejected('https://example.com/x.png')
  })

  it('throws DownloadError for http loopback URLs', async () => {
    await expectRemoteUrlRejected('http://127.0.0.1/')
  })

  it('throws DownloadError for file: URLs', async () => {
    await expectRemoteUrlRejected('file:///etc/passwd')
  })

  it('does not call fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    await denyRemoteChatFileDownload([{ url: new URL('data:text/plain;base64,hi') }]).catch(
      () => undefined,
    )
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('is exported from lib/ai index for chat route wiring', () => {
    expect(denyRemoteChatFileDownloadExport).toBe(denyRemoteChatFileDownload)
  })
})
