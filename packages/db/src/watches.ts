import { randomUUID } from 'node:crypto'
import { and, count, eq } from 'drizzle-orm'
import { getAsset } from './assets.js'
import { getDb } from './client.js'
import { type CoinWatch, coinWatches } from './schema/index.js'

const watchLimit = 20

export async function listWatches({
  userId,
}: {
  userId: string
}): Promise<{ watches: CoinWatch[] }> {
  const db = await getDb()
  return {
    watches: await db.select().from(coinWatches).where(eq(coinWatches.userId, userId)),
  }
}

export async function watchAsset({
  userId,
  assetId,
}: {
  userId: string
  assetId: string
}): Promise<{ watch: CoinWatch | null; error?: 'not_found' | 'limit' }> {
  const db = await getDb()
  const [existing] = await db
    .select()
    .from(coinWatches)
    .where(and(eq(coinWatches.userId, userId), eq(coinWatches.assetId, assetId)))
    .limit(1)
  if (existing) return { watch: existing }

  const { asset } = await getAsset({ id: assetId })
  if (!asset) return { watch: null, error: 'not_found' }

  const [row] = await db
    .select({ n: count() })
    .from(coinWatches)
    .where(eq(coinWatches.userId, userId))
  if ((row?.n ?? 0) >= watchLimit) return { watch: null, error: 'limit' }

  const [watch] = await db
    .insert(coinWatches)
    .values({ id: randomUUID(), userId, assetId })
    .returning()
  return { watch: watch ?? null }
}

export async function unwatchAsset({
  userId,
  assetId,
}: {
  userId: string
  assetId: string
}): Promise<{ deleted: boolean }> {
  const db = await getDb()
  const removed = await db
    .delete(coinWatches)
    .where(and(eq(coinWatches.userId, userId), eq(coinWatches.assetId, assetId)))
    .returning()
  return { deleted: removed.length > 0 }
}
