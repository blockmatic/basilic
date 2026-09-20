import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { assets } from './assets.js'

export const assetNetworks = pgTable(
  'asset_networks',
  {
    id: text('id').primaryKey(),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    chainCaip2: text('chain_caip2').notNull(),
    contractAddress: text('contract_address'),
    decimals: integer('decimals'),
    isNative: boolean('is_native').default(false).notNull(),
  },
  table => [
    uniqueIndex('asset_networks_chain_contract_unique')
      .on(table.chainCaip2, table.contractAddress)
      .where(sql`${table.contractAddress} is not null`),
    index('asset_networks_asset_id_idx').on(table.assetId),
  ],
)

export type AssetNetwork = typeof assetNetworks.$inferSelect
export type NewAssetNetwork = typeof assetNetworks.$inferInsert
