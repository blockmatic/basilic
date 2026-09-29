import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const signInMethods = [
  "magic_link",
  "oauth_google",
  "oauth_github",
  "oauth_facebook",
  "oauth_twitter",
  "passkey",
  "web3_eip155",
  "web3_solana",
] as const;
export type SignInMethod = (typeof signInMethods)[number];

export const sessions = pgTable(
  "sessions",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    currentJti: text("current_jti"),
    deviceFingerprint: text("device_fingerprint"),
    deviceLabel: text("device_label"),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    location: text("location"),
    previousToken: text("previous_token"),
    rotatedAt: timestamp("rotated_at"),
    signInMethod: text("sign_in_method", { enum: signInMethods }),
    token: text("token").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address"),
    walletChain: text("wallet_chain"),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    uniqueIndex("sessions_token_idx").on(table.token),
    index("sessions_user_id_device_fingerprint_idx").on(
      table.userId,
      table.deviceFingerprint
    ),
  ]
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
