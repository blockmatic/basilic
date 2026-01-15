import type { IncomingMessage, ServerResponse } from 'node:http'
import Fastify from 'fastify'
import app from '../src/app'
import { env } from '../src/lib/env.js'

// Vercel serverless function types
type VercelRequest = {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[]>
}

type VercelResponse = {
  statusCode?: number
  setHeader: (name: string, value: string | number) => void
  end: (chunk?: unknown) => void
  send: (body: unknown) => void
}

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  trustProxy: true, // Always trust proxy in Vercel environment
  bodyLimit: env.BODY_LIMIT,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
})

fastify.register(app)

// Initialize Fastify on first request
let isReady = false
const ensureReady = async () => {
  if (!isReady) {
    await fastify.ready()
    isReady = true
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await ensureReady()
  // Fastify can handle Vercel's request/response objects
  // Vercel's request/response are compatible with Node.js HTTP types
  fastify.server.emit(
    'request',
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  )
}
