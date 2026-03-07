import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const totp = pgTable(
  'totp',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    secretEncrypted: text('secret_encrypted').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [index('totp_user_id_idx').on(table.userId)],
)

export type Totp = typeof totp.$inferSelect
export type NewTotp = typeof totp.$inferInsert
