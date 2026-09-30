import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const passkeyCredentials = pgTable(
  "passkey_credentials",
  {
    counter: integer("counter").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    credentialBackedUp: boolean("credential_backed_up"),
    credentialDeviceType: text("credential_device_type"),
    credentialId: text("credential_id").notNull().unique(),
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    publicKey: text("public_key").notNull(),
    transports: jsonb("transports").$type<string[]>(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("passkey_credentials_user_id_idx").on(table.userId)]
);

export type PasskeyCredential = typeof passkeyCredentials.$inferSelect;
export type NewPasskeyCredential = typeof passkeyCredentials.$inferInsert;
