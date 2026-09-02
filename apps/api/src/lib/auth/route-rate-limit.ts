import { env } from '../env.js'

export const productionLoginRateLimitMax = 10

export const authRouteRateLimit = {
  max: env.NODE_ENV === 'production' ? productionLoginRateLimitMax : env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIME_WINDOW,
}

export const authLoginRouteConfig = { rateLimit: authRouteRateLimit }
