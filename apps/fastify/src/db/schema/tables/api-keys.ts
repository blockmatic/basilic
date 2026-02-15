import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    prefix: text('prefix').notNull().unique(),
    hash: text('hash').notNull(),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('api_keys_prefix_idx').on(table.prefix),
    index('api_keys_user_id_idx').on(table.userId),
  ],
)

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
