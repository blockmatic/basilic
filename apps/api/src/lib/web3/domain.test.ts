import { describe, expect, it } from 'vitest'
import { isAllowedWeb3Domain } from './domain.js'

describe('isAllowedWeb3Domain', () => {
  it('allows any domain when origins include *', () => {
    expect(isAllowedWeb3Domain({ domain: 'evil.com', allowedOrigins: ['*'] })).toBe(true)
  })

  it('matches hostname of allowed origin URL', () => {
    expect(
      isAllowedWeb3Domain({
        domain: 'localhost',
        allowedOrigins: ['http://localhost:3000', 'https://app.example.com'],
      }),
    ).toBe(true)
  })

  it('matches host with port when domain includes port', () => {
    expect(
      isAllowedWeb3Domain({
        domain: 'localhost:3000',
        allowedOrigins: ['http://localhost:3000'],
      }),
    ).toBe(true)
  })

  it('rejects domain not in allowlist', () => {
    expect(
      isAllowedWeb3Domain({
        domain: 'evil.com',
        allowedOrigins: ['http://localhost:3000'],
      }),
    ).toBe(false)
  })
})
