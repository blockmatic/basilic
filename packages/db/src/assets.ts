import { and, eq } from 'drizzle-orm'
import { getDb } from './client.js'
import { type Asset, assetMarkets, assetNetworks, assets } from './schema/index.js'

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

export async function findAssetIdByNetwork({
  chainCaip2,
  contractAddress,
  isNative,
}: {
  chainCaip2: string
  contractAddress: string | null
  isNative: boolean
}): Promise<{ assetId: string | null }> {
  const db = await getDb()
  const rows = isNative
    ? await db
        .select({ assetId: assetNetworks.assetId })
        .from(assetNetworks)
        .where(and(eq(assetNetworks.chainCaip2, chainCaip2), eq(assetNetworks.isNative, true)))
        .limit(1)
    : contractAddress
      ? await db
          .select({ assetId: assetNetworks.assetId })
          .from(assetNetworks)
          .where(
            and(
              eq(assetNetworks.chainCaip2, chainCaip2),
              eq(assetNetworks.contractAddress, contractAddress),
            ),
          )
          .limit(1)
      : []
  return { assetId: rows[0]?.assetId ?? null }
}

export async function findBinanceMarket({
  assetId,
}: {
  assetId: string
}): Promise<{ market: { symbol: string } | null }> {
  const db = await getDb()
  const [row] = await db
    .select({ symbol: assetMarkets.symbol })
    .from(assetMarkets)
    .where(and(eq(assetMarkets.assetId, assetId), eq(assetMarkets.provider, 'binance')))
    .limit(1)
  return { market: row ?? null }
}
