import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const assets = pgTable(
  "assets",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    id: text("id").primaryKey(),
    imageUrl: text("image_url"),
    name: text("name").notNull(),
    symbol: varchar("symbol", { length: 32 }).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("assets_symbol_idx").on(table.symbol)]
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
