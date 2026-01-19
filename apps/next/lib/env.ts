import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1).default('development'),
    // Logging configuration
    NEXT_PUBLIC_LOG_ENABLED: z.coerce.boolean().optional(),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_LOG_ENABLED: process.env.NEXT_PUBLIC_LOG_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  },
  emptyStringAsUndefined: true,
})
