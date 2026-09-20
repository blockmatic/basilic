import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { coinMarkets } from './coin-markets.js'
import { users } from './users.js'

export const coinWatches = pgTable(
  'coin_watches',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    geckoId: text('gecko_id')
      .notNull()
      .references(() => coinMarkets.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    uniqueIndex('coin_watches_user_gecko_unique').on(table.userId, table.geckoId),
    index('coin_watches_user_id_idx').on(table.userId),
  ],
)

export type CoinWatch = typeof coinWatches.$inferSelect
export type NewCoinWatch = typeof coinWatches.$inferInsert
