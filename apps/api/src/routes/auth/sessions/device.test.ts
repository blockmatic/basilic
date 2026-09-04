import { describe, expect, it } from 'vitest'
import { parseUserAgent } from '../../../lib/session/index.js'

describe('parseUserAgent', () => {
  it('builds chrome on macos fingerprint', () => {
    const parsed = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    )
    expect(parsed).toEqual({ deviceLabel: 'Chrome on macOS', fingerprint: 'chrome|macos' })
  })

  it('returns null fingerprint for empty UA', () => {
    expect(parseUserAgent(undefined)).toEqual({
      deviceLabel: 'Unknown device',
      fingerprint: null,
    })
  })
})
