import { env } from './env.js'

export const authRouteRateLimit = {
  max: env.NODE_ENV === 'production' ? 10 : env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIME_WINDOW,
}
