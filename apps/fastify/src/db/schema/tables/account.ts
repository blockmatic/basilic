import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.js'

// Account table for OAuth providers (future use)
// Note: NO password field - magic link authentication only
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    // OAuth tokens are encrypted at rest using AES-256-GCM
    // Use encryptAccountTokens() before insert/update and decryptAccountTokens() after select
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('account_user_id_idx').on(table.userId),
    index('account_account_id_idx').on(table.accountId),
  ],
)

export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert
