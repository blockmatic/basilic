import type { CoinWatch } from "@repo/db/schema";
import { Type } from "@sinclair/typebox";

export const WatchItemSchema = Type.Object({
  assetId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  id: Type.String(),
});

export function toWatchItem({ watch }: { watch: CoinWatch }) {
  return {
    assetId: watch.assetId,
    createdAt: watch.createdAt.toISOString(),
    id: watch.id,
  };
}
