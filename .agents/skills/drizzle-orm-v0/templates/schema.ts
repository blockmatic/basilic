/**
 * Drizzle ORM Schema Template
 *
 * Usage:
 * 1. Copy this file to src/db/schema.ts
 * 2. Modify tables for your application
 * 3. Run `npx drizzle-kit generate` to create migrations
 * 4. Run `npx drizzle-kit migrate` to apply migrations
 */

import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// === USERS TABLE ===
// Note: Better Auth manages its own user table.
// This is for application-specific user data.

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(), // From Better Auth
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: text('name'),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
)

// === TASKS TABLE ===
export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    completed: boolean('completed').default(false).notNull(),
    priority: integer('priority').default(0).notNull(),
    dueDate: timestamp('due_date'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('tasks_user_id_idx').on(table.userId),
    completedIdx: index('tasks_completed_idx').on(table.completed),
  }),
)

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}))

// === TYPES ===
// Infer types from schema for type-safe queries

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
