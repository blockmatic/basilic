import { env } from './env.js'

export function channelCors(): {
  origin: '*' | readonly string[]
  credentials: false
  allowHeaders: readonly string[]
} {
  const isWildcard = env.ALLOWED_ORIGINS.includes('*')
  return {
    origin: isWildcard ? '*' : env.ALLOWED_ORIGINS,
    credentials: false,
    allowHeaders: ['authorization', 'content-type'],
  }
}
