import { describe, expect, it } from 'vitest'
import { validateCallbackUrl } from './utils.js'

describe('validateCallbackUrl', () => {
  it('accepts valid https URL', () => {
    expect(validateCallbackUrl('https://example.com/callback')).toBe(true)
  })

  it('accepts valid http URL', () => {
    expect(validateCallbackUrl('http://localhost:3000/auth/callback')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateCallbackUrl('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(validateCallbackUrl('   ')).toBe(false)
  })

  it('rejects relative URL', () => {
    expect(validateCallbackUrl('/callback')).toBe(false)
    expect(validateCallbackUrl('./callback')).toBe(false)
    expect(validateCallbackUrl('../auth/callback')).toBe(false)
  })

  it('rejects non-HTTP(S) schemes', () => {
    expect(validateCallbackUrl('javascript:alert(1)')).toBe(false)
    expect(validateCallbackUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    expect(validateCallbackUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects invalid URL format', () => {
    expect(validateCallbackUrl('not-a-valid-url')).toBe(false)
  })
})
