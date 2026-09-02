import { describe, expect, it } from 'vitest'
import { hashLoginCode, hashToken } from './jwt.js'

describe('hashLoginCode', () => {
  it('should differ from unsalted SHA-256 for 6-digit codes', () => {
    const code = '123456'
    expect(hashLoginCode(code)).not.toBe(hashToken(code))
  })

  it('should be stable for the same code', () => {
    const code = '654321'
    expect(hashLoginCode(code)).toBe(hashLoginCode(code))
  })

  it('should produce 64-char hex output', () => {
    expect(hashLoginCode('100000')).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('hashToken', () => {
  it('should remain unsalted SHA-256', () => {
    const token = 'test-secret'
    expect(hashToken(token)).toBe(hashToken(token))
    expect(hashToken(token)).not.toBe(hashLoginCode(token))
  })
})
