import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const passkeyCallback = pgTable(
  'passkey_callback',
  {
    id: text('id').primaryKey(),
    codeHash: text('code_hash').notNull(),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  table => [
    index('passkey_callback_code_hash_idx').on(table.codeHash),
    index('passkey_callback_expires_at_idx').on(table.expiresAt),
  ],
)

export type PasskeyCallback = typeof passkeyCallback.$inferSelect
export type NewPasskeyCallback = typeof passkeyCallback.$inferInsert
