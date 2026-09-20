import { eq } from 'drizzle-orm'
import { getDb } from './client.js'
import { type Session, sessions, type User, users } from './schema/index.js'

export async function getValidSession({
  sid,
  userId,
}: {
  sid: string
  userId: string
}): Promise<{ session: Session; user: User } | null> {
  const db = await getDb()
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sid)).limit(1)
  if (!session || session.expiresAt < new Date()) return null
  if (session.userId !== userId) return null
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return null
  return { session, user }
}
