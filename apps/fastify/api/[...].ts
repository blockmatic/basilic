import type { IncomingMessage, ServerResponse } from 'node:http'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Fastify from 'fastify'
import app from '../src/app.js'
import { waitForDatabase } from '../src/db/health.js'
import { runMigrations } from '../src/db/migrate.js'
import { env } from '../src/lib/env.js'
import {
  getInitializationPromise,
  getInitializationStatus,
  setInitializationPromise,
  setInitializationStatus,
} from '../src/lib/init-state.js'

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

/**
 * Emit initialization failure metric
 */
const emitInitFailureMetric = () => {
  // Log as metric event for monitoring systems to pick up
  fastify.log.warn(
    { metric: 'init_failure', timestamp: Date.now() },
    'Initialization failure metric',
  )
}

/**
 * Initialize database and run migrations (runs once per serverless function instance)
 * Uses promise lock to prevent race conditions from multiple concurrent callers
 */
const initialize = async (): Promise<void> => {
  // Return existing promise if initialization is already in progress
  const existingPromise = getInitializationPromise()
  if (existingPromise) {
    return existingPromise
  }

  // If already initialized, return immediately
  if (getInitializationStatus()) {
    return Promise.resolve()
  }

  const logger = {
    info: (msg: string) => fastify.log.info(msg),
    error: (msg: string, err?: unknown) => fastify.log.error({ err }, msg),
  }

  // Create pending promise and store immediately before starting async work
  // This prevents race conditions where concurrent callers see null
  let resolvePromise!: () => void
  const initPromise = new Promise<void>(resolve => {
    resolvePromise = resolve
  })

  // Store promise immediately before async work begins
  setInitializationPromise(initPromise)

  // Start async work after promise is stored
  ;(async () => {
    try {
      // Wait for database connection
      await waitForDatabase(logger)

      // Run migrations
      await runMigrations(logger)

      setInitializationStatus(true)
      resolvePromise()
    } catch (err) {
      fastify.log.error({ err }, 'Initialization failed')
      setInitializationStatus(false)
      emitInitFailureMetric()
      // Don't throw - allow function to start even if migrations fail
      // This prevents complete failure if there's a transient issue
      resolvePromise()
    } finally {
      // Clear promise lock after completion so subsequent calls see isInitialized
      setInitializationPromise(null)
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
  fastify.server.emit(
    'request',
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  )
}
