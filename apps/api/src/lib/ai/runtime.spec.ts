import { EventEmitter } from 'node:events'
import { describe, expect, it } from 'vitest'
import { createRequestAbortSignal } from './runtime.js'

function mockRequestReply({ writableEnded }: { writableEnded: boolean }) {
  const socket = new EventEmitter()
  const requestRaw = Object.assign(new EventEmitter(), { socket })
  const replyRaw = Object.assign(new EventEmitter(), {
    writableEnded,
    off(event: string, listener: (...args: unknown[]) => void) {
      EventEmitter.prototype.off.call(this, event, listener)
    },
  })
  return {
    request: { raw: requestRaw },
    reply: { raw: replyRaw },
    socket,
    replyRaw,
  }
}

describe('createRequestAbortSignal', () => {
  it('does not abort when the response already completed', async () => {
    const { request, reply, replyRaw } = mockRequestReply({ writableEnded: true })
    const signal = createRequestAbortSignal({
      request: request as never,
      reply: reply as never,
    })
    replyRaw.emit('close')
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(signal.aborted).toBe(false)
  })

  it('aborts on premature response close', async () => {
    const { request, reply, replyRaw } = mockRequestReply({ writableEnded: false })
    const signal = createRequestAbortSignal({
      request: request as never,
      reply: reply as never,
    })
    replyRaw.emit('close')
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(signal.aborted).toBe(true)
  })
})
