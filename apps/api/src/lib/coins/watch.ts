import type { CoinWatch } from '@repo/db/schema'
import { Type } from '@sinclair/typebox'

export const WatchItemSchema = Type.Object({
  id: Type.String(),
  assetId: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

export function toWatchItem({ watch }: { watch: CoinWatch }) {
  return {
    id: watch.id,
    assetId: watch.assetId,
    createdAt: watch.createdAt.toISOString(),
  }
}
