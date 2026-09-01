import rateLimit from '@fastify/rate-limit'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getError } from '../lib/catalogs/mapper.js'
import { env } from '../lib/env.js'
import { getTrustedClientIp } from '../lib/request.js'

type RateLimitPluginOptions = Record<string, never>

const rateLimitPlugin: FastifyPluginAsync<RateLimitPluginOptions> = async fastify => {
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    keyGenerator: request => getTrustedClientIp(request),
    errorResponseBuilder: (_request, context) => {
      const timeWindowSeconds = Math.round(env.RATE_LIMIT_TIME_WINDOW / 1000)
      const rateLimitError = getError('RATE_LIMIT_EXCEEDED') ?? {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      }
      return {
        code: rateLimitError.code,
        message: `${rateLimitError.message}. Maximum ${context.max} requests per ${timeWindowSeconds}s`,
        retryAfter: timeWindowSeconds,
      }
    },
  })
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
})
