import { env } from '../env.js'

export const coinsRouteRateLimit = {
  max: env.COINS_RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIME_WINDOW,
}

export const coinsRouteRateLimitConfig = { rateLimit: coinsRouteRateLimit }
