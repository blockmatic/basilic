import { and, eq, isNull } from 'drizzle-orm'
import type { getDb } from '../../db/index.js'
import { sessions, verification } from '../../db/schema/index.js'
import { hashToken } from '../jwt.js'

type DbForRevoke = Awaited<ReturnType<typeof getDb>>

export async function consumeSessionRevokeToken({
  db,
  token,
  verificationId,
}: {
  db: DbForRevoke
  token: string
  verificationId: string
}): Promise<'ok' | 'invalid' | 'expired'> {
  const tokenHash = hashToken(token)
  const [row] = await db
    .select()
    .from(verification)
    .where(
      and(
        eq(verification.id, verificationId),
        eq(verification.type, 'session_revoke'),
        eq(verification.value, tokenHash),
      ),
    )

  if (!row) return 'invalid'
  if (row.consumedAt) return 'ok'
  if (row.expiresAt < new Date()) return 'expired'

  const consumed = await db
    .update(verification)
    .set({ consumedAt: new Date() })
    .where(and(eq(verification.id, row.id), isNull(verification.consumedAt)))
    .returning()

  if (consumed.length === 0) return 'ok'

  await db.delete(sessions).where(eq(sessions.id, row.identifier))
  return 'ok'
}
