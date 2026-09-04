import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const signInMethods = [
  'magic_link',
  'oauth_google',
  'oauth_github',
  'oauth_facebook',
  'oauth_twitter',
  'passkey',
  'web3_eip155',
  'web3_solana',
] as const
export type SignInMethod = (typeof signInMethods)[number]

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    signInMethod: text('sign_in_method', { enum: signInMethods }),
    deviceLabel: text('device_label'),
    location: text('location'),
    deviceFingerprint: text('device_fingerprint'),
    walletChain: text('wallet_chain'),
    walletAddress: text('wallet_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
    uniqueIndex('sessions_token_idx').on(table.token),
    index('sessions_user_id_device_fingerprint_idx').on(table.userId, table.deviceFingerprint),
  ],
)

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
