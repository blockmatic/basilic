import { DownloadError } from 'ai'
import { describe, expect, it, vi } from 'vitest'
import { denyRemoteChatFileDownload } from './download.js'
import { denyRemoteChatFileDownload as denyRemoteChatFileDownloadExport } from './index.js'

const expectRemoteUrlRejected = async (url: string) => {
  try {
    await denyRemoteChatFileDownload([{ url: new URL(url) }])
    expect.fail('expected remote URL to be rejected')
  } catch (error) {
    expect(error).toBeInstanceOf(DownloadError)
    expect((error as Error).message).toContain('Remote file URLs are not allowed')
  }
}

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
