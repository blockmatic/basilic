import { boolean, index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    name: text('name'),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [index('users_email_idx').on(table.email)],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
