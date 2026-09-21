import { describe, expect, it } from 'vitest'
import { inspectSessionPayload } from './ingress.js'

describe('inspectSessionPayload', () => {
  it('rejects client system roles', () => {
    expect(
      inspectSessionPayload({ body: { messages: [{ role: 'system', content: 'x' }] } }),
    ).toEqual({
      ok: false,
      message: 'Invalid request: system role messages are not allowed',
    })
  })

  it('allows data file URLs and rejects remote files', () => {
    expect(
      inspectSessionPayload({
        body: {
          messages: [{ role: 'user', parts: [{ type: 'file', url: 'data:text/plain,hi' }] }],
        },
      }),
    ).toEqual({ ok: true })
    expect(
      inspectSessionPayload({
        body: {
          messages: [{ role: 'user', parts: [{ type: 'file', url: 'https://evil.example/x' }] }],
        },
      }),
    ).toMatchObject({ ok: false })
  })
})
