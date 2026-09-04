import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { getDb } from '../../db/index.js'
import { sessions, users, verification } from '../../db/schema/index.js'
import type { VerificationType } from '../../db/schema/tables/verification.js'
import { env } from '../../lib/env.js'

export type VerificationLastResult = {
  token: string | null
  verificationId: string | null
}

const emptyResult: VerificationLastResult = { token: null, verificationId: null }

function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

function extractFromScopedFakeEmail({
  fastify,
  email,
}: {
  fastify: FastifyInstance
  email: string
}): VerificationLastResult {
  const captured = fastify.fakeEmail?.all().findLast(e => e.to === email)
  if (!captured) return emptyResult
  return {
    verificationId: fastify.fakeEmail?.extractVerificationId(captured) ?? null,
    token: fastify.fakeEmail?.extractToken(captured) ?? null,
  }
}

export function isTestEmailAllowed(email: string | undefined): email is string {
  return typeof email === 'string' && email.endsWith('@test.ai')
}

export function isAllowedTestType(
  type: string | undefined,
): type is 'magic_link' | 'change_email' | 'session_revoke' {
  return type === 'magic_link' || type === 'change_email' || type === 'session_revoke'
}

export async function getLastVerification({
  fastify,
  type,
  email,
}: {
  fastify: FastifyInstance
  type: VerificationType
  email: string
}): Promise<VerificationLastResult> {
  if (!env.ALLOW_TEST || env.NODE_ENV === 'production') return emptyResult

  const db = await getDb()

  if (type === 'session_revoke') {
    const [row] = await db
      .select({ id: verification.id, tokenPlain: verification.tokenPlain })
      .from(verification)
      .innerJoin(sessions, eq(verification.identifier, sessions.id))
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(verification.type, type),
          eq(users.email, email),
          isNotNull(verification.tokenPlain),
        ),
      )
      .orderBy(desc(verification.createdAt))
      .limit(1)
    if (row) return { token: row.tokenPlain, verificationId: row.id }
    return extractFromScopedFakeEmail({ fastify, email })
  }

  const where =
    type === 'magic_link'
      ? and(
          eq(verification.type, type),
          eq(verification.identifier, email),
          isNotNull(verification.tokenPlain),
        )
      : and(
          eq(verification.type, type),
          sql`${verification.identifier} LIKE ${`%:${escapeLikePattern(email)}`} ESCAPE '\\'`,
          isNotNull(verification.tokenPlain),
        )

  const [row] = await db
    .select({ id: verification.id, tokenPlain: verification.tokenPlain })
    .from(verification)
    .where(where)
    .orderBy(desc(verification.createdAt))
    .limit(1)

  if (row) return { token: row.tokenPlain, verificationId: row.id }
  return extractFromScopedFakeEmail({ fastify, email })
}

export async function getLastMagicLinkForTestAi({
  fastify,
  email,
}: {
  fastify: FastifyInstance
  email: string
}): Promise<VerificationLastResult> {
  if (!env.ALLOW_TEST || env.NODE_ENV === 'production') return emptyResult
  if (!isTestEmailAllowed(email)) return emptyResult
  return getLastVerification({ fastify, type: 'magic_link', email })
}
