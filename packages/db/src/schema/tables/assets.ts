import { boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const assets = pgTable(
  'assets',
  {
    id: text('id').primaryKey(),
    symbol: varchar('symbol', { length: 32 }).notNull(),
    name: text('name').notNull(),
    imageUrl: text('image_url'),
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [index('assets_symbol_idx').on(table.symbol)],
)

export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
