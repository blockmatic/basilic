import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import app from '../../src/app.js'

export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  }).withTypeProvider<TypeBoxTypeProvider>()

  await fastify.register(app)
  await fastify.ready()
  return fastify
}
