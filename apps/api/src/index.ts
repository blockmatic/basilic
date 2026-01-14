import Fastify from 'fastify'
import app from './app.js'
import { env } from './lib/env.js'

const fastify = Fastify({
  logger: true,
})

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
