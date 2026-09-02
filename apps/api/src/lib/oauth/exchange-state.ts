import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Verification } from '../../db/schema/index.js'
import { verification } from '../../db/schema/index.js'

type Db = Awaited<ReturnType<typeof import('../../db/index.js').getDb>>

export type ValidateOAuthStateResult =
  | { ok: true; isLinkMode: boolean; linkUserId?: string; stateRecord: Verification }
  | { ok: false }

export async function validateAndConsumeOAuthState({
  db,
  stateHash,
  request,
  reply,
  preConsumeCheck,
}: {
  db: Db
  stateHash: string
  request: FastifyRequest
  reply: FastifyReply
  preConsumeCheck?: (stateRecord: Verification) => { code: string; message: string } | null
}): Promise<ValidateOAuthStateResult> {
  const [stateRecord] = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.value, stateHash),
        inArray(verification.type, ['oauth_state', 'oauth_link_state']),
        isNull(verification.consumedAt),
      ),
    )

  if (!stateRecord) {
    reply.code(401).send({ code: 'INVALID_STATE', message: 'Invalid or expired state' })
    return { ok: false }
  }

  if (stateRecord.expiresAt < new Date()) {
    await db.delete(verification).where(eq(verification.id, stateRecord.id))
    reply.code(401).send({ code: 'EXPIRED_STATE', message: 'State has expired' })
    return { ok: false }
  }

  const isLinkMode = stateRecord.type === 'oauth_link_state'
  const linkUserId = stateRecord.meta?.userId

  if (preConsumeCheck) {
    const err = preConsumeCheck(stateRecord)
    if (err) {
      reply.code(401).send(err)
      return { ok: false }
    }
  }

  if (isLinkMode) {
    if (!linkUserId) {
      reply.code(401).send({ code: 'INVALID_STATE', message: 'Invalid link state' })
      return { ok: false }
    }
    if (!request.session || request.session.user.id !== linkUserId) {
      reply.code(401).send({
        code: 'INVALID_STATE',
        message: 'Session required for account linking',
      })
      return { ok: false }
    }
  }

  const consumed = await db
    .update(verification)
    .set({ consumedAt: new Date() })
    .where(and(eq(verification.id, stateRecord.id), isNull(verification.consumedAt)))
    .returning()
  if (consumed.length === 0) {
    reply.code(401).send({ code: 'INVALID_STATE', message: 'Invalid or expired state' })
    return { ok: false }
  }

  return {
    ok: true,
    isLinkMode,
    linkUserId,
    stateRecord,
  }
}
