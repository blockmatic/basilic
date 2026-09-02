import { describe, expect, it } from 'vitest'
import { hashToken } from '../jwt.js'
import { generateApiKey, parseApiKey } from './keys.js'

describe('api-keys', () => {
  describe('generateApiKey', () => {
    it('returns key with bask_ prefix', () => {
      const { key } = generateApiKey()
      expect(key).toMatch(/^bask_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/)
    })

    it('returns prefix and hash matching key structure', () => {
      const { key, prefix, hash } = generateApiKey()
      const parsed = parseApiKey(key)
      expect(parsed).not.toBeNull()
      if (!parsed) return
      expect(parsed.prefix).toBe(prefix)
      expect(hashToken(parsed.secret)).toBe(hash)
    })
  })

  describe('parseApiKey', () => {
    it('returns null for non-bask token', () => {
      expect(parseApiKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBeNull()
      expect(parseApiKey('invalid')).toBeNull()
    })

    it('returns null for malformed bask token', () => {
      expect(parseApiKey('bask_')).toBeNull()
      expect(parseApiKey('bask_abc')).toBeNull()
    })

    it('parses valid key', () => {
      const parsed = parseApiKey('bask_12345678_secret_part')
      expect(parsed).not.toBeNull()
      if (!parsed) return
      expect(parsed.prefix).toBe('12345678')
      expect(parsed.secret).toBe('secret_part')
    })

    it('handles secret with underscores', () => {
      const parsed = parseApiKey('bask_abcdefgh_aa_bb_cc')
      expect(parsed).not.toBeNull()
      if (!parsed) return
      expect(parsed.prefix).toBe('abcdefgh')
      expect(parsed.secret).toBe('aa_bb_cc')
    })
  })

  describe('hashToken', () => {
    it('returns consistent hash for same secret', () => {
      const h1 = hashToken('secret')
      const h2 = hashToken('secret')
      expect(h1).toBe(h2)
    })
  })
})
