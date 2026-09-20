import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const walletIdentities = pgTable(
  'wallet_identities',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    chain: text('chain', { enum: ['eip155', 'solana'] }).notNull(),
    address: text('address').notNull(),
    walletProvider: text('wallet_provider'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  },
  table => [
    unique('wallet_chain_address_unique').on(table.chain, table.address),
    index('wallet_user_id_idx').on(table.userId),
    index('wallet_address_idx').on(table.address),
  ],
)

export type WalletIdentity = typeof walletIdentities.$inferSelect
export type NewWalletIdentity = typeof walletIdentities.$inferInsert
