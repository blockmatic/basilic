import { eq } from 'drizzle-orm'
import { getDb } from './client.js'
import { users } from './schema/index.js'

export type AccountSnapshot = {
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  joinedAt: string | null
}

export async function getAccountSnapshot({
  userId,
}: {
  userId: string
}): Promise<{ account: AccountSnapshot | null }> {
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return { account: null }
  return {
    account: {
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      username: user.username ?? null,
      joinedAt: user.createdAt.toISOString(),
    },
  }
}
