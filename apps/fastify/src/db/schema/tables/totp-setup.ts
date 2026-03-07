import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const totpSetup = pgTable(
  'totp_setup',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    secretEncrypted: text('secret_encrypted').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  table => [index('totp_setup_user_id_idx').on(table.userId)],
)

export type TotpSetup = typeof totpSetup.$inferSelect
export type NewTotpSetup = typeof totpSetup.$inferInsert
