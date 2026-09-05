import { captureError } from '@repo/error/node'
import { consumeStream, createUIMessageStreamResponse, toUIMessageStream } from 'ai'
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify'
import { sendCatalogError } from '../catalogs/mapper.js'
import { env } from '../env.js'
import type { ResolvedProvider } from './provider.js'
import { isInsufficientCreditsError } from './upstream-error.js'

export function createRequestAbortSignal({
  request,
  reply,
}: {
  request: FastifyRequest
  reply: FastifyReply
}): AbortSignal {
  const requestAbortController = new AbortController()
  function onPrematureClose() {
    if (reply.raw.writableEnded) return
    requestAbortController.abort()
  }
  const socket = request.raw.socket
  reply.raw.once('close', onPrematureClose)
  socket?.once('close', onPrematureClose)
  requestAbortController.signal.addEventListener('abort', () => {
    reply.raw.off('close', onPrematureClose)
    socket?.off('close', onPrematureClose)
  })
  return AbortSignal.any([
    requestAbortController.signal,
    AbortSignal.timeout(env.AI_UPSTREAM_TIMEOUT_MS),
  ])
}

export function createUiMessageStreamResponse(result: {
  stream: Parameters<typeof toUIMessageStream>[0]['stream']
}): Response {
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
    consumeSseStream: consumeStream,
  })
}

export function sendWebResponse(reply: FastifyReply, response: Response): FastifyReply {
  for (const [k, v] of response.headers) reply.raw.setHeader(k, v)
  reply.raw.statusCode = response.status
  return reply.send(response.body as never)
}

export function handleUpstreamError({
  reply,
  err,
  logger,
  route,
  provider,
  startMs,
}: {
  reply: FastifyReply
  err: unknown
  logger: FastifyBaseLogger
  route: string
  provider: ResolvedProvider | null
  startMs: number
}): FastifyReply {
  const errObj = err instanceof Error ? err : new Error(String(err))
  captureError({
    error: errObj,
    label: route,
    logger,
    data: {
      route,
      provider,
      durationMs: Date.now() - startMs,
    },
  })
  if (isInsufficientCreditsError(err))
    return sendCatalogError({ reply, status: 402, code: 'INSUFFICIENT_CREDITS' })
  if (errObj.name === 'AbortError' || errObj.name === 'TimeoutError')
    return sendCatalogError({ reply, status: 504, code: 'UPSTREAM_TIMEOUT' })
  return sendCatalogError({ reply, status: 502, code: 'UPSTREAM_SERVICE_ERROR' })
}
