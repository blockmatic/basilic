import fastifyJwt from '@fastify/jwt'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'

const jwtPlugin: FastifyPluginAsync = async fastify => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    verify: {
      allowedIss: env.JWT_ISSUER,
      allowedAud: env.JWT_AUDIENCE,
    },
  })
}

export default fp(jwtPlugin, {
  name: 'jwt',
  dependencies: [],
})
