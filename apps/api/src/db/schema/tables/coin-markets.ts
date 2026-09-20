import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const coinMarkets = pgTable(
  'coin_markets',
  {
    id: text('id').primaryKey(),
    symbol: varchar('symbol', { length: 32 }).notNull(),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    priceUsd: doublePrecision('price_usd').notNull(),
    change24h: doublePrecision('change24h').notNull().default(0),
    volumeUsd: doublePrecision('volume_usd').notNull().default(0),
    marketCapUsd: doublePrecision('market_cap_usd').notNull().default(0),
    rank: integer('rank').notNull().default(0),
    fetchedAt: timestamp('fetched_at').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('coin_markets_rank_idx').on(table.rank),
    index('coin_markets_symbol_idx').on(table.symbol),
  ],
)

export type CoinMarket = typeof coinMarkets.$inferSelect
export type NewCoinMarket = typeof coinMarkets.$inferInsert
