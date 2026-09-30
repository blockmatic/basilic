import { index, pgTable, text, unique } from "drizzle-orm/pg-core";

import { assets } from "./assets.js";

export const assetProviders = pgTable(
  "asset_providers",
  {
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    providerId: text("provider_id").notNull(),
  },
  (table) => [
    unique("asset_providers_provider_id_unique").on(
      table.provider,
      table.providerId
    ),
    index("asset_providers_asset_id_idx").on(table.assetId),
  ]
);

export type AssetProvider = typeof assetProviders.$inferSelect;
export type NewAssetProvider = typeof assetProviders.$inferInsert;
