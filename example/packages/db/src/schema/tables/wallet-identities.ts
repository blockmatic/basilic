import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const walletIdentities = pgTable(
  "wallet_identities",
  {
    address: text("address").notNull(),
    chain: text("chain", { enum: ["eip155", "solana"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    walletProvider: text("wallet_provider"),
  },
  (table) => [
    unique("wallet_chain_address_unique").on(table.chain, table.address),
    index("wallet_user_id_idx").on(table.userId),
    index("wallet_address_idx").on(table.address),
  ]
);

export type WalletIdentity = typeof walletIdentities.$inferSelect;
export type NewWalletIdentity = typeof walletIdentities.$inferInsert;
