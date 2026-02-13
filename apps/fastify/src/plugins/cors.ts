import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

type CorsPluginOptions = Record<string, never>

const corsPlugin: FastifyPluginAsync<CorsPluginOptions> = async fastify => {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
    maxAge: 86400,
  })
}

export default fp(corsPlugin, {
  name: 'cors',
})
