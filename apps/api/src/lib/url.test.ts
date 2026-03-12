import { describe, expect, it } from 'vitest'
import { appendCodeToCallbackUrl, isAllowedUrl } from './url.js'

describe('appendCodeToCallbackUrl', () => {
  it('appends code as query param when URL has no query or fragment', () => {
    const result = appendCodeToCallbackUrl('https://example.com/auth/callback', 'abc123')
    expect(result).toBe('https://example.com/auth/callback?code=abc123')
  })

  it('appends code with & when URL has existing query', () => {
    const result = appendCodeToCallbackUrl('https://example.com/auth/callback?foo=bar', 'abc123')
    expect(result).toBe('https://example.com/auth/callback?foo=bar&code=abc123')
  })

  it('places code in query and reattaches fragment', () => {
    const result = appendCodeToCallbackUrl('https://example.com/auth/callback#section', 'abc123')
    expect(result).toBe('https://example.com/auth/callback?code=abc123#section')
    const parsed = new URL(result)
    expect(parsed.searchParams.get('code')).toBe('abc123')
    expect(parsed.hash).toBe('#section')
  })

  it('preserves fragment when URL has both query and fragment', () => {
    const result = appendCodeToCallbackUrl(
      'https://example.com/auth/callback?x=1#section',
      'abc123',
    )
    expect(result).toBe('https://example.com/auth/callback?x=1&code=abc123#section')
  })

  it('encodes code for URL safety', () => {
    const result = appendCodeToCallbackUrl('https://example.com/auth/callback', 'a+b=c&d')
    expect(result).toBe('https://example.com/auth/callback?code=a%2Bb%3Dc%26d')
  })
})

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
