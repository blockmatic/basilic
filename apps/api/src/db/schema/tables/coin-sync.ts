import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const coinSync = pgTable('coin_sync', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  fetchedAt: timestamp('fetched_at'),
  lastError: text('last_error'),
  lastStatus: integer('last_status'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type CoinSync = typeof coinSync.$inferSelect
export type NewCoinSync = typeof coinSync.$inferInsert
