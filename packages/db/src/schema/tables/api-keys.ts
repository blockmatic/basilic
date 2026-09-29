import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const apiKeys = pgTable(
  "api_keys",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    hash: text("hash").notNull(),
    id: text("id").primaryKey(),
    lastUsedAt: timestamp("last_used_at"),
    name: text("name").notNull(),
    prefix: text("prefix").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("api_keys_prefix_idx").on(table.prefix),
    index("api_keys_user_id_idx").on(table.userId),
  ]
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
