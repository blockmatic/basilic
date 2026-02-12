import rateLimit from '@fastify/rate-limit'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../lib/env.js'

type RateLimitPluginOptions = Record<string, never>

const rateLimitPlugin: FastifyPluginAsync<RateLimitPluginOptions> = async fastify => {
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    // Use in-memory store by default
    // To use Redis, configure @fastify/rate-limit-redis and pass redis option
    // Add rate limit headers to response
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    // Custom key generator to use real IP from proxy
    keyGenerator: request => {
      // Get real IP from proxy headers
      const forwarded = request.headers['x-forwarded-for']
      if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded
        return ips.split(',')[0].trim()
      }
      return request.ip
    },
    // Custom error handler
    errorResponseBuilder: (_request, context) => {
      const timeWindowSeconds = Math.round(env.RATE_LIMIT_TIME_WINDOW / 1000)
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${context.max} requests per ${timeWindowSeconds}s`,
        retryAfter: timeWindowSeconds,
      }
    },
  })
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
})
