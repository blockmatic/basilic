import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const totp = pgTable(
  "totp",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    secretEncrypted: text("secret_encrypted").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
  },
  (_table) => []
);

export type Totp = typeof totp.$inferSelect;
export type NewTotp = typeof totp.$inferInsert;
