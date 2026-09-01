import { and, desc, eq, isNotNull, like } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { getDb } from '../../db/index.js'
import { verification } from '../../db/schema/index.js'
import type { VerificationType } from '../../db/schema/tables/verification.js'
import { env } from '../../lib/env.js'

export type VerificationLastResult = {
  token: string | null
  verificationId: string | null
}

const emptyResult: VerificationLastResult = { token: null, verificationId: null }

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

export function isAllowedTestType(type: string | undefined): type is 'magic_link' | 'change_email' {
  return type === 'magic_link' || type === 'change_email'
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

  const where =
    type === 'magic_link'
      ? and(
          eq(verification.type, type),
          eq(verification.identifier, email),
          isNotNull(verification.tokenPlain),
        )
      : and(
          eq(verification.type, type),
          like(verification.identifier, `%:${email}`),
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
  email?: string
}): Promise<VerificationLastResult> {
  if (!env.ALLOW_TEST || env.NODE_ENV === 'production') return emptyResult

  if (email) {
    if (!isTestEmailAllowed(email)) return emptyResult
    return getLastVerification({ fastify, type: 'magic_link', email })
  }

  const db = await getDb()
  const [row] = await db
    .select({ id: verification.id, tokenPlain: verification.tokenPlain })
    .from(verification)
    .where(
      and(
        like(verification.identifier, '%@test.ai'),
        eq(verification.type, 'magic_link'),
        isNotNull(verification.tokenPlain),
      ),
    )
    .orderBy(desc(verification.createdAt))
    .limit(1)

  const verificationId = row?.id ?? fastify.fakeEmail?.extractVerificationId() ?? null
  const token = row?.tokenPlain ?? fastify.fakeEmail?.extractToken() ?? null
  return { token, verificationId }
}
