import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { assets } from "./assets.js";
import { users } from "./users.js";

export const coinWatches = pgTable(
  "coin_watches",
  {
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("coin_watches_user_asset_unique").on(
      table.userId,
      table.assetId
    ),
    index("coin_watches_user_id_idx").on(table.userId),
  ]
);

export type CoinWatch = typeof coinWatches.$inferSelect;
export type NewCoinWatch = typeof coinWatches.$inferInsert;
