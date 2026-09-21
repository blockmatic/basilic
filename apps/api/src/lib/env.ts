import 'dotenv/config'
import { parseBool } from '@repo/utils/logger/types'
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

const defaultWebAppUrl = 'http://localhost:3000'

function originFromWebAppUrl(webAppUrl: string): string {
  try {
    return new URL(webAppUrl).origin
  } catch {
    return new URL(defaultWebAppUrl).origin
  }
}

/** Dev/test keep `*`. Production never boots with a wildcard: omit or `*` uses `WEB_APP_URL` origin. */
export function parseAllowedOrigins({
  raw,
  isProduction: production,
  webAppUrl,
}: {
  raw: string | undefined
  isProduction: boolean
  webAppUrl: string
}): string[] {
  const webOrigin = originFromWebAppUrl(webAppUrl)
  const fallback = production ? webOrigin : '*'
  const parts = (raw ?? fallback)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const origins = parts.length > 0 ? parts : [fallback]
  if (production && (origins.length === 0 || origins.includes('*'))) return [webOrigin]
  return origins
}

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3001),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    CI: z
      .string()
      .optional()
      .transform(val => parseBool(val, false)),
    PGLITE: z
      .string()
      .optional()
      .transform(val => parseBool(val, false)),
    DATABASE_URL: z
      .string()
      .optional()
      .transform(val => {
        if (parseBool(process.env.PGLITE, false) && !val) return 'postgresql://localhost/test'
        return val ?? ''
      })
      .refine(val => parseBool(process.env.PGLITE, false) || val.length > 0, {
        message: 'DATABASE_URL is required when PGLITE is not enabled',
      }),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().positive().default(60000),
    TRUST_PROXY: z
      .string()
      .optional()
      .transform(val => parseBool(val, true)),
    SECURITY_HEADERS_ENABLED: z
      .string()
      .optional()
      .transform(val => parseBool(val, true)),
    BODY_LIMIT: z.coerce.number().int().positive().default(1048576),
    REQUEST_TIMEOUT: z.coerce.number().int().positive().default(30000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    LOG_ENABLED: z
      .string()
      .optional()
      .transform(val => parseBool(val, true)),
    LOG_SERVICE: z.string().min(1).default('api'),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    OLLAMA_BASE_URL: z.string().url().optional(),
    AI_UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().optional().default(120_000),
    AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(256).max(16_000).optional().default(4096),
    AI_RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(20),
    COINS_RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(10),
    AI_PROVIDER: z.enum(['anthropic', 'openrouter', 'ollama']).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    OPEN_ROUTER_API_KEY: z.string().min(1).optional(),
    AI_DEFAULT_MODEL: z.string().min(1).optional(),
    COINGECKO_DEMO_API_KEY: z.string().min(1).optional(),
    COINS_USE_FIXTURE: z
      .string()
      .optional()
      .transform(val => parseBool(val, false)),
    MARKETS_CACHE_MS: z.coerce.number().int().positive().default(300_000),
    ALCHEMY_API_KEY: z.string().min(1).optional(),
    COIN_MAJOR_SYMBOLS: z
      .string()
      .default('btc,eth,sol')
      .transform(val =>
        val
          .split(',')
          .map(s => s.trim().toLowerCase())
          .filter(Boolean),
      )
      .refine(val => val.length > 0, 'COIN_MAJOR_SYMBOLS must include at least one symbol'),
    ENCRYPTION_KEY: encryptionKeySchema,
    JWT_SECRET: jwtSecretSchema,
    ACCESS_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
    REFRESH_REUSE_GRACE_SECONDS: z.coerce.number().int().nonnegative().default(10),
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
    WEB_APP_URL: z.string().url().default(defaultWebAppUrl),
    DOCS_SITE_URL: z.string().url().default('https://basilic-docs.vercel.app'),
    EVE_COMMAND_URL: z.string().url().default('http://127.0.0.1:3004'),
    EVE_CHAT_URL: z.string().url().default('http://127.0.0.1:3005'),
    ALLOW_TEST: z
      .string()
      .optional()
      .transform(val => parseBool(val, false)),
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
      .optional()
      .transform(val =>
        parseAllowedOrigins({
          raw: val,
          isProduction,
          webAppUrl: process.env.WEB_APP_URL ?? defaultWebAppUrl,
        }),
      )
      .refine(
        val => !isProduction || (val.length > 0 && !val.includes('*')),
        'ALLOWED_ORIGINS must be a non-empty list of explicit origins in production (not *)',
      ),
    TOTP_ISSUER: z.string().optional(),
    WEBAUTHN_RP_NAME: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

/** Zod defaults `LOG_LEVEL` to info; tests stay silent unless the env var is set. */
export const logLevelProvided = process.env.LOG_LEVEL != null && process.env.LOG_LEVEL !== ''
