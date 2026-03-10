import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

function parseCallbackUrls(val: string | undefined): string[] | undefined {
  if (!val) return undefined
  const arr = val
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const result: string[] = []
  for (const item of arr)
    try {
      const u = new URL(item)
      if ((u.protocol !== 'http:' && u.protocol !== 'https:') || !u.hostname)
        throw new Error('Invalid scheme or hostname')
      result.push(item)
    } catch {
      throw new Error(`OAUTH_*_CALLBACK_URLS: invalid URL "${item}"`)
    }

  return result.length > 0 ? result : undefined
}

const hex64 = z
  .string()
  .length(64)
  .regex(/^[0-9a-fA-F]+$/, 'Must be a 32-byte hex string')

const isProduction = process.env.NODE_ENV === 'production'
const weakEncryptionKey = '0'.repeat(64)
const rejectedDevDefault = 'default-jwt-secret-min-32-chars-for-dev'

const encryptionKeySchema = isProduction
  ? hex64.refine(
      val => val !== weakEncryptionKey,
      'ENCRYPTION_KEY must not be the all-zero default in production',
    )
  : hex64.default(weakEncryptionKey)

const jwtSecretSchema = isProduction
  ? z
      .string()
      .min(32)
      .refine(
        val => val !== rejectedDevDefault,
        'JWT_SECRET must not be the dev default in production',
      )
  : z.string().min(32).default(rejectedDevDefault)

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3001),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    CI: z.coerce.boolean().default(false),
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
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().positive().default(60000),
    TRUST_PROXY: z.coerce.boolean().default(true),
    SECURITY_HEADERS_ENABLED: z.coerce.boolean().default(true),
    BODY_LIMIT: z.coerce.number().int().positive().default(1048576),
    REQUEST_TIMEOUT: z.coerce.number().int().positive().default(30000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    OLLAMA_BASE_URL: z.string().url().optional().default('https://ollama.gaboesquivel.com'),
    AI_PROVIDER: z.enum(['ollama', 'openrouter']).optional(),
    OPEN_ROUTER_API_KEY: z.string().min(1).optional(),
    AI_DEFAULT_MODEL: z.string().min(1).optional(),
    BRAVE_SEARCH_API_KEY: z.string().min(1).optional(),
    ENCRYPTION_KEY: encryptionKeySchema,
    JWT_SECRET: jwtSecretSchema,
    ACCESS_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
    JWT_ISSUER: z.string().default('api.yourapp.com'),
    JWT_AUDIENCE: z
      .string()
      .default('api.yourapp.com')
      .transform(val => val.split(',').map(aud => aud.trim())),
    RESEND_API_KEY: z.string().min(1).default('re_placeholder'),
    EMAIL_FROM: z.string().email().default('noreply@localhost'),
    EMAIL_FROM_NAME: z.string().default('App'),
    APP_NAME: z
      .string()
      .transform(v => v.trim())
      .pipe(z.string().min(1))
      .pipe(
        z
          .string()
          .refine(
            v => process.env.NODE_ENV !== 'production' || v !== 'Your App',
            'APP_NAME must not be the placeholder in production',
          ),
      )
      .default('Your App'),
    ALLOW_TEST: z.coerce.boolean().default(false),
    // GitHub OAuth (optional - OAuth routes return 503 when unset)
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    OAUTH_GITHUB_CALLBACK_URL: z.string().url().optional(),
    OAUTH_GITHUB_CALLBACK_URLS: z
      .string()
      .optional()
      .transform(val => parseCallbackUrls(val)),
    // Google OAuth (optional - One Tap + redirect fallback)
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    OAUTH_GOOGLE_CALLBACK_URL: z.string().url().optional(),
    OAUTH_GOOGLE_CALLBACK_URLS: z
      .string()
      .optional()
      .transform(val => parseCallbackUrls(val)),
    // Facebook OAuth (optional)
    FACEBOOK_CLIENT_ID: z.string().min(1).optional(),
    FACEBOOK_CLIENT_SECRET: z.string().min(1).optional(),
    OAUTH_FACEBOOK_CALLBACK_URL: z.string().url().optional(),
    OAUTH_FACEBOOK_CALLBACK_URLS: z
      .string()
      .optional()
      .transform(val => parseCallbackUrls(val)),
    // Twitter OAuth (optional, PKCE)
    TWITTER_CLIENT_ID: z.string().min(1).optional(),
    TWITTER_CLIENT_SECRET: z.string().min(1).optional(),
    OAUTH_TWITTER_CALLBACK_URL: z.string().url().optional(),
    OAUTH_TWITTER_CALLBACK_URLS: z
      .string()
      .optional()
      .transform(val => parseCallbackUrls(val)),
    ALLOWED_ORIGINS: z
      .string()
      .default('*')
      .transform(val => {
        const parts = val
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        return parts.length > 0 ? parts : ['*']
      }),
    TOTP_ISSUER: z.string().optional(),
    WEBAUTHN_RP_NAME: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
