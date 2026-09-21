import { and, eq } from 'drizzle-orm'
import { getDb } from './client.js'
import { type WalletIdentity, walletIdentities } from './schema/index.js'

export async function getLinkedEip155({
  userId,
}: {
  userId: string
}): Promise<{ identity: WalletIdentity | null }> {
  const db = await getDb()
  const [identity] = await db
    .select()
    .from(walletIdentities)
    .where(and(eq(walletIdentities.userId, userId), eq(walletIdentities.chain, 'eip155')))
    .limit(1)
  return { identity: identity ?? null }
}

export async function countLinkedEip155({
  userId,
}: {
  userId: string
}): Promise<{ count: number }> {
  const { identity } = await getLinkedEip155({ userId })
  return { count: identity ? 1 : 0 }
}
