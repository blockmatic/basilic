import { env } from '../env.js'

export const aiRouteRateLimit = {
  max: env.AI_RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIME_WINDOW,
}

export const aiRouteRateLimitConfig = { rateLimit: aiRouteRateLimit }
