import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const authAttempts = pgTable(
  'auth_attempts',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(), // IP or identifier for rate limiting
    type: text('type', { enum: ['magic_link'] })
      .notNull()
      .default('magic_link'),
    failedAttempts: integer('failed_attempts').notNull().default(0),
    firstFailureAt: timestamp('first_failure_at'),
    lockedUntil: timestamp('locked_until'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [index('auth_attempts_key_type_idx').on(table.key, table.type)],
)

export type AuthAttempt = typeof authAttempts.$inferSelect
export type NewAuthAttempt = typeof authAttempts.$inferInsert
