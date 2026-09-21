import { describe, expect, it } from 'vitest'
import { eventsFromNdjson, joinEveUrl } from './session-http'

describe('joinEveUrl', () => {
  it('joins origin and path without a double slash', () => {
    expect(joinEveUrl({ host: 'http://127.0.0.1:3004/', path: '/eve/v1/session' })).toBe(
      'http://127.0.0.1:3004/eve/v1/session',
    )
  })
})

describe('eventsFromNdjson', () => {
  it('stops at session.waiting', () => {
    expect(
      eventsFromNdjson({
        text: [
          JSON.stringify({ type: 'action.result', data: { result: { toolName: 'set_view' } } }),
          JSON.stringify({ type: 'session.waiting' }),
          JSON.stringify({ type: 'session.completed' }),
        ].join('\n'),
      }).map(event => event.type),
    ).toEqual(['action.result', 'session.waiting'])
  })
})
