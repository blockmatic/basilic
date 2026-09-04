import { eq } from 'drizzle-orm'
import type { getDb } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import type { SessionNotifyUser } from './notify.js'

type DbForUser = Pick<Awaited<ReturnType<typeof getDb>>, 'select'>

export async function loadSessionUser({
  db,
  userId,
}: {
  db: DbForUser
  userId: string
}): Promise<SessionNotifyUser | undefined> {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
  return user
}
