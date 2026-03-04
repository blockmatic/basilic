import { describe, expect, it } from 'vitest'
import { isAllowedUrl } from './url.js'

describe('isAllowedUrl', () => {
  it('accepts valid https URL when allowlist has *', () => {
    expect(isAllowedUrl('https://example.com/callback')).toBe(true)
  })

  it('accepts valid http URL when allowlist has *', () => {
    expect(isAllowedUrl('http://localhost:3000/auth/callback')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isAllowedUrl('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(isAllowedUrl('   ')).toBe(false)
  })

  it('rejects relative URL', () => {
    expect(isAllowedUrl('/callback')).toBe(false)
    expect(isAllowedUrl('./callback')).toBe(false)
    expect(isAllowedUrl('../auth/callback')).toBe(false)
  })

  it('rejects non-HTTP(S) schemes', () => {
    expect(isAllowedUrl('javascript:alert(1)')).toBe(false)
    expect(isAllowedUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(isAllowedUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects invalid URL format', () => {
    expect(isAllowedUrl('not-a-valid-url')).toBe(false)
  })
})
