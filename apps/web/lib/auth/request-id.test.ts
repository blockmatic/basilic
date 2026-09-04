import { describe, expect, it } from 'vitest'
import { resolveRequestId } from './request-id'

describe('resolveRequestId', () => {
  it('reuses a valid incoming x-request-id', () => {
    const headers = new Headers({ 'x-request-id': 'web-abc_1' })
    expect(resolveRequestId(headers)).toBe('web-abc_1')
  })

  it('generates when missing or invalid', () => {
    expect(resolveRequestId(new Headers({ 'x-request-id': 'not valid' }))).toMatch(
      /^[A-Za-z0-9._-]{1,128}$/,
    )
    expect(resolveRequestId()).toMatch(/^[A-Za-z0-9._-]{1,128}$/)
  })
})
