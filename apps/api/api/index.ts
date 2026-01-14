import type { IncomingMessage, ServerResponse } from 'node:http'
import Fastify from 'fastify'
import app from '../src/app'

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
  logger: true,
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
