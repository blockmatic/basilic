import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const passkeyChallenges = pgTable(
  'passkey_challenges',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    challenge: text('challenge').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  table => [
    index('passkey_challenges_user_id_idx').on(table.userId),
    index('passkey_challenges_expires_at_idx').on(table.expiresAt),
  ],
)

export type PasskeyChallenge = typeof passkeyChallenges.$inferSelect
export type NewPasskeyChallenge = typeof passkeyChallenges.$inferInsert
