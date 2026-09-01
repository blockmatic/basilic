import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'

type CorsPluginOptions = Record<string, never>

const corsPlugin: FastifyPluginAsync<CorsPluginOptions> = async fastify => {
  const isWildcard = env.ALLOWED_ORIGINS.includes('*')

  await fastify.register(cors, {
    origin: isWildcard ? true : env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Requested-With',
      'Accept',
      'Accept-Language',
    ],
    credentials: false,
    maxAge: 86400,
  })
}

export default fp(corsPlugin, {
  name: 'cors',
})
