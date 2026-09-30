import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    username: varchar("username", { length: 48 }).unique(),
  },
  (table) => [index("users_email_idx").on(table.email)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
