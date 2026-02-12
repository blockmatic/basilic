import type { IncomingMessage, ServerResponse } from 'node:http'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify from 'fastify'
import app from '../src/app.js'
import { runMigrations } from '../src/db/migrate.js'
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
let initPromise: Promise<void> | null = null

/**
 * Initialize database and run migrations (runs once per serverless function instance)
 * Uses promise lock to prevent race conditions from multiple concurrent callers
 */
const initialize = async (): Promise<void> => {
  // Return existing promise if initialization is already in progress
  if (initPromise) {
    return initPromise
  }

  // If already initialized, return immediately
  if (isReady) {
    return Promise.resolve()
  }

  const logger = {
    info: (msg: string) => fastify.log.info(msg),
    error: (msg: string, err?: unknown) => fastify.log.error({ err }, msg),
  }

  // Create promise and store immediately before starting async work
  // This prevents race conditions where concurrent callers see null
  initPromise = (async () => {
    try {
      // Run migrations (getDb() handles connection for PostgreSQL)
      await runMigrations(logger)
    } catch (err) {
      fastify.log.error({ err }, 'Initialization failed')
      fastify.log.warn(
        { metric: 'init_failure', timestamp: Date.now() },
        'Initialization failure metric',
      )
      // Don't throw - allow function to start even if migrations fail
      // This prevents complete failure if there's a transient issue
    } finally {
      // Clear promise lock after completion
      initPromise = null
    }
  })()

  return initPromise
}

const ensureReady = async () => {
  if (!isReady) {
    // Initialize database and migrations before ready
    await initialize()
    await fastify.ready()
    isReady = true
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await ensureReady()
  // Vercel rewrite (.*) -> /api/$1 means the function receives /api/... paths.
  // Strip /api prefix so Fastify routes (e.g. /reference/openapi.json) match.
  const msg = req as unknown as IncomingMessage
  if (msg.url?.startsWith('/api')) {
    msg.url = msg.url.slice(4) || '/'
  }
  fastify.server.emit('request', msg, res as unknown as ServerResponse)
}
