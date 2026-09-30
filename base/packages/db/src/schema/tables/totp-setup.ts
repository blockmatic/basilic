import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const totpSetup = pgTable(
  "totp_setup",
  {
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    secretEncrypted: text("secret_encrypted").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
  },
  (_table) => []
);

export type TotpSetup = typeof totpSetup.$inferSelect;
export type NewTotpSetup = typeof totpSetup.$inferInsert;
