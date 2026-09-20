import { eq } from 'drizzle-orm'
import { getDb } from './client.js'
import { type Asset, assets } from './schema/index.js'

export async function listAssets(): Promise<{ assets: Asset[] }> {
  const db = await getDb()
  return {
    assets: await db.select().from(assets).where(eq(assets.enabled, true)),
  }
}

export async function getAsset({ id }: { id: string }): Promise<{ asset: Asset | null }> {
  const db = await getDb()
  const [asset] = await db.select().from(assets).where(eq(assets.id, id)).limit(1)
  return { asset: asset ?? null }
}
