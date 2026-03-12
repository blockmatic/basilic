import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const web3Callback = pgTable(
  'web3_callback',
  {
    id: text('id').primaryKey(),
    codeHash: text('code_hash').notNull(),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('web3_callback_code_hash_idx').on(table.codeHash),
    index('web3_callback_expires_at_idx').on(table.expiresAt),
  ],
)

export type Web3Callback = typeof web3Callback.$inferSelect
export type NewWeb3Callback = typeof web3Callback.$inferInsert
