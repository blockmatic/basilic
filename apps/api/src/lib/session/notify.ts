import { randomUUID } from 'node:crypto'
import LoginNotificationEmail from '@repo/email/emails/login-notification'
import { render } from '@repo/email/render'
import { and, eq, ne } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { getDb } from '../../db/index.js'
import { sessions, verification } from '../../db/schema/index.js'
import type { SignInMethod } from '../../db/schema/tables/sessions.js'
import { sendMail } from '../email.js'
import { env } from '../env.js'
import { generateToken, hashToken } from '../jwt.js'
import { isAllowedUrl } from '../url.js'
import { signInTypeLabel } from './device.js'

type NotifyDb = Pick<Awaited<ReturnType<typeof getDb>>, 'insert' | 'select'>

export type SessionNotifyUser = {
  id: string
  email?: string | null
  name?: string | null
}

export function allowlistedWebAppOrigin(webAppUrl = env.WEB_APP_URL): string | null {
  const base = webAppUrl.replace(/\/$/, '')
  if (!isAllowedUrl(base)) return null
  return base
}

export function webAppPathUrl(path: string): string | undefined {
  const origin = allowlistedWebAppOrigin()
  if (!origin) return undefined
  return `${origin}${path}`
}

export async function notifyNewDeviceSignIn({
  fastify,
  db,
  sessionId,
  user,
  signInMethod,
  deviceLabel,
  deviceFingerprint,
  ipAddress,
  location,
  expiresAt,
}: {
  fastify: FastifyInstance
  db: NotifyDb
  sessionId: string
  user: SessionNotifyUser
  signInMethod: SignInMethod
  deviceLabel: string
  deviceFingerprint: string | null
  ipAddress: string
  location?: string
  expiresAt: Date
}): Promise<void> {
  if (!user.email) {
    fastify.log.info({ reason: 'no_email' }, 'email_skipped')
    return
  }

  const origin = allowlistedWebAppOrigin()
  if (!origin) {
    fastify.log.info({ reason: 'allowlist' }, 'email_skipped')
    return
  }

  if (deviceFingerprint) {
    const others = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, user.id),
          eq(sessions.deviceFingerprint, deviceFingerprint),
          ne(sessions.id, sessionId),
        ),
      )
      .limit(1)
    if (others.length > 0) {
      fastify.log.info({ reason: 'known_fingerprint' }, 'email_skipped')
      return
    }
  }

  const token = generateToken()
  const verificationId = randomUUID()
  const ttlMs = Math.min(24 * 60 * 60 * 1000, Math.max(0, expiresAt.getTime() - Date.now()))
  if (ttlMs === 0) {
    fastify.log.info({ reason: 'ttl' }, 'email_skipped')
    return
  }

  const storePlain = env.ALLOW_TEST && user.email.endsWith('@test.ai')
  await db.insert(verification).values({
    id: verificationId,
    type: 'session_revoke',
    identifier: sessionId,
    value: hashToken(token),
    ...(storePlain && { tokenPlain: token }),
    expiresAt: new Date(Date.now() + ttlMs),
    meta: { userId: user.id, sessionId },
  })

  const signOutUrl = `${origin}/auth/session/revoke?verificationId=${encodeURIComponent(verificationId)}&token=${encodeURIComponent(token)}`
  const sessionsUrl = `${origin}/settings/security/sessions`
  const timestamp = new Date().toISOString()
  const emailProps = {
    signInType: signInTypeLabel(signInMethod),
    device: deviceLabel,
    ipAddress,
    timestamp,
    signOutUrl,
    location,
    fullName: user.name ?? undefined,
    appName: env.APP_NAME,
    sessionsUrl,
  }

  void (async () => {
    const html = await render(LoginNotificationEmail(emailProps))
    const text = await render(LoginNotificationEmail(emailProps), { plainText: true })
    await sendMail({
      provider: fastify.emailProvider,
      logger: fastify.log,
      mode: 'fireAndForget',
      message: {
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: user.email as string,
        subject: `New device signed in to your ${env.APP_NAME} account`,
        html,
        text,
      },
    })
  })()
}
