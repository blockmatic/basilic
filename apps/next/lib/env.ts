import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    ALLOW_TEST: z.enum(['true', 'false']).optional(),
    AUTH_COOKIE_NAME: z.string().default('api.session'),
    JWT_SECRET:
      process.env.NODE_ENV === 'production'
        ? z
            .string()
            .min(32)
            .refine(
              val => val !== 'default-jwt-secret-min-32-chars-for-dev',
              'JWT_SECRET must not be the dev default in production',
            )
        : z.string().min(32).default('default-jwt-secret-min-32-chars-for-dev'),
    NEWSAPI_KEY: z.string().optional(),
    ERROR_REPORTING_DSN: z.string().min(1).optional(),
    ERROR_REPORTING_ENVIRONMENT: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_AUTH_COOKIE_NAME: z.string().default('api.session'),
    NEXT_PUBLIC_ERROR_REPORTING_DSN: z.string().min(1).optional(),
    NEXT_PUBLIC_ERROR_REPORTING_ENVIRONMENT: z.string().min(1).optional(),
    // Logging configuration
    NEXT_PUBLIC_LOG_ENABLED: z.coerce.boolean().optional(),
    NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).optional(),
    // Policy pages (privacy, terms)
    NEXT_PUBLIC_LEGAL_EMAIL: z.string().email().default('legal@example.com'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    ALLOW_TEST: process.env.ALLOW_TEST,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    NEWSAPI_KEY: process.env.NEWSAPI_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_AUTH_COOKIE_NAME:
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME,
    NEXT_PUBLIC_ERROR_REPORTING_DSN: process.env.NEXT_PUBLIC_ERROR_REPORTING_DSN,
    NEXT_PUBLIC_ERROR_REPORTING_ENVIRONMENT: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENVIRONMENT,
    ERROR_REPORTING_DSN: process.env.ERROR_REPORTING_DSN,
    ERROR_REPORTING_ENVIRONMENT: process.env.ERROR_REPORTING_ENVIRONMENT,
    NEXT_PUBLIC_LOG_ENABLED: process.env.NEXT_PUBLIC_LOG_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_LEGAL_EMAIL: process.env.NEXT_PUBLIC_LEGAL_EMAIL,
  },
  emptyStringAsUndefined: true,
})
