import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const passkeyAuthChallenges = pgTable(
  'passkey_auth_challenges',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    challenge: text('challenge').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  table => [
    index('passkey_auth_challenges_session_id_idx').on(table.sessionId),
    index('passkey_auth_challenges_expires_at_idx').on(table.expiresAt),
  ],
)

export type PasskeyAuthChallenge = typeof passkeyAuthChallenges.$inferSelect
export type NewPasskeyAuthChallenge = typeof passkeyAuthChallenges.$inferInsert
