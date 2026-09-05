import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { env } from '../env.js'
import { createRequestAbortSignal } from './runtime.js'

function mockRequestReply({
  writableEnded,
  socket = new EventEmitter(),
}: {
  writableEnded: boolean
  socket?: EventEmitter
}) {
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
  afterEach(() => {
    vi.useRealTimers()
  })

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

  it('removes socket close listeners after a completed request and a timed-out request', async () => {
    vi.useFakeTimers()
    const socket = new EventEmitter()
    const completed = mockRequestReply({ writableEnded: true, socket })
    createRequestAbortSignal({
      request: completed.request as never,
      reply: completed.reply as never,
    })
    completed.replyRaw.emit('close')
    expect(socket.listenerCount('close')).toBe(0)

    const timedOut = mockRequestReply({ writableEnded: false, socket })
    createRequestAbortSignal({
      request: timedOut.request as never,
      reply: timedOut.reply as never,
    })
    expect(socket.listenerCount('close')).toBeGreaterThan(0)
    await vi.advanceTimersByTimeAsync(env.AI_UPSTREAM_TIMEOUT_MS)
    expect(socket.listenerCount('close')).toBe(0)
  })
})
