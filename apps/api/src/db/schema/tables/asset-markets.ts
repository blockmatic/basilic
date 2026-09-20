import { index, pgTable, text, unique, varchar } from 'drizzle-orm/pg-core'
import { assets } from './assets.js'

export const assetMarkets = pgTable(
  'asset_markets',
  {
    id: text('id').primaryKey(),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    symbol: varchar('symbol', { length: 32 }).notNull(),
    quote: varchar('quote', { length: 16 }).notNull(),
  },
  table => [
    unique('asset_markets_provider_symbol_unique').on(table.provider, table.symbol),
    index('asset_markets_asset_id_idx').on(table.assetId),
  ],
)

export type AssetMarket = typeof assetMarkets.$inferSelect
export type NewAssetMarket = typeof assetMarkets.$inferInsert
