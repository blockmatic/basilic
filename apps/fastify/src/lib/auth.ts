import { captureError } from '@repo/error/node'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { Resend } from 'resend'
import { getDb } from '../db/index.js'
import * as schema from '../db/schema/index.js'
import { web3Plugin } from './auth-plugins/web3.js'
import { env } from './env.js'

const resend = new Resend(env.RESEND_API_KEY)

// Initialize auth instance - db will be initialized on first use
// Better Auth adapter will access db when needed
let authInstance: ReturnType<typeof betterAuth> | null = null

export async function getAuth() {
  if (!authInstance) {
    const db = await getDb()
    // Better Auth with Drizzle adapter does NOT auto-create tables
    // All tables must be created via Drizzle migrations (see src/db/migrate.ts)
    // The drizzleAdapter expects tables to already exist - it will NOT create them
    authInstance = betterAuth({
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          ...schema,
          user: schema.users, // Map 'user' model to 'users' table
          session: schema.sessions, // Map 'session' model to 'sessions' table
          verification: schema.verification, // Magic link tokens
          account: schema.account, // OAuth accounts (future use)
        },
      }),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
      plugins: [
        magicLink({
          sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
            try {
              await resend.emails.send({
                from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
                to: email,
                subject: 'Sign in to your account',
                html: `
              <p>Hello,</p>
              <p>Click the link below to sign in:</p>
              <a href="${url}">Sign In</a>
            `,
              })
            } catch (error) {
              captureError({
                code: 'INTERNAL_ERROR',
                error: error instanceof Error ? error : new Error(String(error)),
                label: 'sendMagicLink failed',
                data: {
                  emailDomain: email.split('@')[1] || '[redacted]',
                  magicLinkSent: false,
                },
                tags: {
                  app: 'api',
                  module: 'auth-service',
                  function: 'sendMagicLink',
                },
              })
              throw error
            }
          },
        }),
        web3Plugin(),
      ],
      session: {
        cookieName: 'better-auth.session_token',
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
          enabled: true,
          maxAge: 60 * 5, // 5 minutes
        },
      },
      advanced: {
        cookiePrefix: 'better-auth',
        defaultCookieAttributes: {
          secure: env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        },
      },
    })
  }
  return authInstance
}

// Type export for Better Auth instance
export type Auth = Awaited<ReturnType<typeof getAuth>>
