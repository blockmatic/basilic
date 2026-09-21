import { describe, expect, it } from 'vitest'
import { amountFromHex } from './amount.js'

describe('amountFromHex', () => {
  it('splits hex by decimals', () => {
    expect(amountFromHex({ balanceHex: '0x1', decimals: 0 })).toBe('1')
    expect(amountFromHex({ balanceHex: '0x3b9aca00', decimals: 6 })).toBe('1000')
    expect(amountFromHex({ balanceHex: '0x0', decimals: 18 })).toBe('0')
  })

  it('returns 0 on bad hex', () => {
    expect(amountFromHex({ balanceHex: 'nope', decimals: 18 })).toBe('0')
  })
})
