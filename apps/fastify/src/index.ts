import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { initSentry } from '@repo/error/node'
import Fastify from 'fastify'
import app from './app.js'
import { env } from './lib/env.js'

// Initialize Sentry BEFORE Fastify instance creation
initSentry({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
})

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
  trustProxy: env.TRUST_PROXY,
  bodyLimit: env.BODY_LIMIT,
  requestTimeout: env.REQUEST_TIMEOUT,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
}).withTypeProvider<TypeBoxTypeProvider>()

fastify.register(app)

const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: env.HOST })
    fastify.log.info({ port: env.PORT, host: env.HOST }, 'Server started')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Received shutdown signal, closing server gracefully')

  try {
    // Close server with timeout
    await fastify.close()
    fastify.log.info('Server closed successfully')
    process.exit(0)
  } catch (err) {
    fastify.log.error({ err }, 'Error during shutdown')
    process.exit(1)
  }
}

// Register signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', err => {
  fastify.log.error({ err }, 'Uncaught exception')
  shutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error({ reason, promise }, 'Unhandled rejection')
  shutdown('unhandledRejection')
})

start()
