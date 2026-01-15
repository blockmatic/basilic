import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'
import app from './app.js'
import { env } from './lib/env.js'

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
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
}).withTypeProvider<TypeBoxTypeProvider>()

fastify.register(app)

const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: env.HOST })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
