import type { IncomingMessage, ServerResponse } from 'node:http'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify from 'fastify'
import app from '../src/app.js'
import { env } from '../src/lib/env.js'

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  trustProxy: true,
  bodyLimit: env.BODY_LIMIT,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
})

fastify.register(app)

let isReady = false
const ensureReady = async () => {
  if (!isReady) {
    await fastify.ready()
    isReady = true
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await ensureReady()
  fastify.server.emit(
    'request',
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  )
}
