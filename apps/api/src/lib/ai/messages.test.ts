import { describe, expect, it } from 'vitest'
import { isAllowedChatFileUrl } from './messages.js'

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
