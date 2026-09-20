import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const web3Nonce = pgTable(
  'web3_nonce',
  {
    id: text('id').primaryKey(),
    chain: text('chain', { enum: ['eip155', 'solana'] }).notNull(),
    address: text('address').notNull(),
    nonce: text('nonce').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('web3_nonce_chain_address_idx').on(table.chain, table.address),
    index('web3_nonce_expires_at_idx').on(table.expiresAt),
  ],
)

export type Web3Nonce = typeof web3Nonce.$inferSelect
export type NewWeb3Nonce = typeof web3Nonce.$inferInsert
