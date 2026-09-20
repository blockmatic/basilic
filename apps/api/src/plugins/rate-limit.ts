import rateLimit from '@fastify/rate-limit'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getError } from '../lib/catalogs/mapper.js'
import {
  applyIetfRateLimitHeaders,
  applyProblemContentType,
  toCatalogProblem,
} from '../lib/catalogs/problem.js'
import { env } from '../lib/env.js'
import { getTrustedClientIp } from '../lib/request.js'

type RateLimitPluginOptions = {
  max?: number
  timeWindow?: number
}

const rateLimitPlugin: FastifyPluginAsync<RateLimitPluginOptions> = async (fastify, opts) => {
  const max = opts.max ?? env.RATE_LIMIT_MAX
  const timeWindow = opts.timeWindow ?? env.RATE_LIMIT_TIME_WINDOW
  const windowSeconds = Math.round(timeWindow / 1000)

  fastify.addHook('onSend', async (_request, reply, payload) => {
    if (reply.statusCode === 429) applyProblemContentType({ reply })
    applyIetfRateLimitHeaders({ reply, windowSeconds })
    return payload
  })

  await fastify.register(rateLimit, {
    max,
    timeWindow,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    keyGenerator: request => getTrustedClientIp(request),
    errorResponseBuilder: (_request, context) => {
      const rateLimitError = getError('RATE_LIMIT_EXCEEDED') ?? {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      }
      const detail = `${rateLimitError.message}. Maximum ${context.max} requests per ${windowSeconds}s`
      return {
        ...toCatalogProblem({
          code: rateLimitError.code,
          message: rateLimitError.message,
          status: 429,
          detail,
        }),
        retryAfter: Math.ceil(context.ttl / 1000),
      }
    },
  })
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
})
