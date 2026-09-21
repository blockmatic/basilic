import { describe, expect, it } from 'vitest'
import { consumeRateLimit } from './rate-limit.js'

describe('consumeRateLimit', () => {
  it('allows hits under max and rejects the next in the window', () => {
    const first = consumeRateLimit({ hits: [], now: 1000, windowMs: 60_000, max: 2 })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = consumeRateLimit({ hits: first.hits, now: 2000, windowMs: 60_000, max: 2 })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const third = consumeRateLimit({ hits: second.hits, now: 3000, windowMs: 60_000, max: 2 })
    expect(third).toMatchObject({ ok: false, retryAfterSeconds: 58 })
  })

  it('expires hits outside the window', () => {
    const result = consumeRateLimit({
      hits: [1],
      now: 70_000,
      windowMs: 60_000,
      max: 1,
    })
    expect(result.ok).toBe(true)
  })
})
