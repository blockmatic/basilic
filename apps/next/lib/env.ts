import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    ALLOW_TEST: z.enum(['true', 'false']).optional(),
    AUTH_COOKIE_NAME: z.string().default('api.session'),
    NEWSAPI_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development')
      .optional(),
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_AUTH_COOKIE_NAME: z.string().default('api.session'),
    // Logging configuration
    NEXT_PUBLIC_LOG_ENABLED: z.coerce.boolean().optional(),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    ALLOW_TEST: process.env.ALLOW_TEST,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    NEWSAPI_KEY: process.env.NEWSAPI_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_COOKIE_NAME:
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME,
    NEXT_PUBLIC_LOG_ENABLED: process.env.NEXT_PUBLIC_LOG_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  },
  emptyStringAsUndefined: true,
})
