import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const web3Nonce = pgTable(
  "web3_nonce",
  {
    address: text("address").notNull(),
    chain: text("chain", { enum: ["eip155", "solana"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    nonce: text("nonce").notNull(),
  },
  (table) => [
    index("web3_nonce_chain_address_idx").on(table.chain, table.address),
    index("web3_nonce_expires_at_idx").on(table.expiresAt),
  ]
);

export type Web3Nonce = typeof web3Nonce.$inferSelect;
export type NewWeb3Nonce = typeof web3Nonce.$inferInsert;
