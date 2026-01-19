import cors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'

type CorsPluginOptions = Record<string, never>

const corsPlugin: FastifyPluginAsync<CorsPluginOptions> = async fastify => {
  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true)
      }

      // Allow all origins if configured as '*'
      if (env.ALLOWED_ORIGINS === '*') {
        return callback(null, true)
      }

      // Check if origin is in allowed list
      const allowedOrigins = Array.isArray(env.ALLOWED_ORIGINS)
        ? env.ALLOWED_ORIGINS
        : [env.ALLOWED_ORIGINS]

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // Reject origin
      return callback(new Error('Not allowed by CORS'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false, // Set to true if you need to send cookies
    maxAge: 86400, // 24 hours
  })
}

export default fp(corsPlugin, {
  name: 'cors',
})
