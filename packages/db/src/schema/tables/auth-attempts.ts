import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const authAttempts = pgTable(
  "auth_attempts",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    firstFailureAt: timestamp("first_failure_at"),
    id: text("id").primaryKey(),
    key: text("key").notNull(), // IP or identifier for rate limiting
    lockedUntil: timestamp("locked_until"),
    type: text("type", { enum: ["magic_link", "change_email"] })
      .notNull()
      .default("magic_link"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("auth_attempts_key_type_idx").on(table.key, table.type),
    uniqueIndex("auth_attempts_key_type_unique").on(table.key, table.type),
  ]
);

export type AuthAttempt = typeof authAttempts.$inferSelect;
export type NewAuthAttempt = typeof authAttempts.$inferInsert;
