import { describe, expect, it } from 'vitest'
import { parseEveSessionCursor, serializeEveSessionCursor } from './session'

describe('parseEveSessionCursor', () => {
  it('reads sessionId plus streamIndex', () => {
    expect(parseEveSessionCursor({ value: '{"sessionId":"abc","streamIndex":4}' })).toEqual({
      sessionId: 'abc',
      streamIndex: 4,
    })
  })

  it('upgrades a bare session id', () => {
    expect(parseEveSessionCursor({ value: 'legacy-id' })).toEqual({
      sessionId: 'legacy-id',
      streamIndex: 0,
    })
  })
})

describe('serializeEveSessionCursor', () => {
  it('omits an empty cursor', () => {
    expect(serializeEveSessionCursor({ session: null })).toBeUndefined()
  })
})
