import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

const hex64 = z
  .string()
  .length(64)
  .regex(/^[0-9a-fA-F]+$/, 'Must be a 32-byte hex string')

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3001),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PGLITE: z.coerce.boolean().default(false),
    DATABASE_URL: z
      .string()
      .optional()
      .transform(val => {
        if (process.env.PGLITE === 'true' && !val) return 'postgresql://localhost/test'
        return val ?? ''
      })
      .refine(val => (process.env.PGLITE !== 'true' ? val !== undefined && val.length > 0 : true), {
        message: 'DATABASE_URL is required when PGLITE is not enabled',
      }),
    ALLOWED_ORIGINS: z
      .string()
      .default('*')
      .transform(val => (val === '*' ? '*' : val.split(',').map(origin => origin.trim()))),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().positive().default(60000),
    TRUST_PROXY: z.coerce.boolean().default(true),
    SECURITY_HEADERS_ENABLED: z.coerce.boolean().default(true),
    BODY_LIMIT: z.coerce.number().int().positive().default(1048576),
    REQUEST_TIMEOUT: z.coerce.number().int().positive().default(30000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    OPEN_ROUTER_API_KEY: z.string().min(1),
    ENCRYPTION_KEY: hex64.default('0'.repeat(64)),
    JWT_SECRET: z.string().min(32).default('default-jwt-secret-min-32-chars-for-dev'),
    ACCESS_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
    JWT_ISSUER: z.string().default('api.yourapp.com'),
    JWT_AUDIENCE: z
      .string()
      .default('api.yourapp.com')
      .transform(val => val.split(',').map(aud => aud.trim())),
    MAGIC_LINK_CALLBACK_HOST_ALLOWLIST: z
      .string()
      .optional()
      .transform(val => (val ? val.split(',').map(host => host.trim()) : undefined)),
    RESEND_API_KEY: z.string().min(1).default('re_placeholder'),
    EMAIL_FROM: z.string().email().default('noreply@localhost'),
    EMAIL_FROM_NAME: z.string().default('App'),
    USE_FAKE_EMAIL: z.coerce.boolean().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
