# Drizzle ORM PostgreSQL Patterns

## Schema Definition

```typescript
// db/schema/users.ts
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Relations

```typescript
// db/schema/relations.ts
import { relations } from 'drizzle-orm';
import { users } from './users';
import { posts } from './posts';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

## Database Client

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

## Query Patterns

```typescript
import { eq, and, or, like, desc, asc } from 'drizzle-orm';

// Find one
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Find many with relations
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
  where: eq(users.emailVerified, true),
  orderBy: [desc(users.createdAt)],
  limit: 10,
});

// Complex where
const results = await db.query.posts.findMany({
  where: and(
    eq(posts.published, true),
    or(
      like(posts.title, '%search%'),
      like(posts.content, '%search%')
    )
  ),
});
```

## Mutation Patterns

```typescript
// Insert
const [newUser] = await db.insert(users).values({
  email: 'test@example.com',
  name: 'Test User',
}).returning();

// Insert many
await db.insert(users).values([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' },
]);

// Update
await db.update(users)
  .set({ name: 'New Name', updatedAt: new Date() })
  .where(eq(users.id, userId));

// Delete
await db.delete(users)
  .where(eq(users.id, userId));
```

## Transaction Patterns

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values(userData).returning();
  await tx.insert(profiles).values({ userId: user.id, ...profileData });
  await tx.insert(settings).values({ userId: user.id, ...defaultSettings });
});
```

## Error Handling (v0.44+)

```typescript
import { DrizzleQueryError } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

// Error handling in queries
try {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
} catch (error) {
  if (error instanceof DrizzleQueryError) {
    // Handle structured error
    if (error.cause?.code === '23505') {
      // Unique constraint violation
      throw new Error('User already exists');
    }
    throw new Error(`Database error: ${error.message}`);
  }
  throw error;
}

// Error handling in mutations
try {
  const [newUser] = await db.insert(users).values({
    email: 'test@example.com',
    name: 'Test User',
  }).returning();
} catch (error) {
  if (error instanceof DrizzleQueryError) {
    // Check PostgreSQL error codes
    const pgError = error.cause;
    if (pgError?.code === '23505') {
      throw new Error('Email already exists');
    }
    if (pgError?.code === '23503') {
      throw new Error('Foreign key constraint violation');
    }
  }
  throw error;
}

// Error handling in transactions
try {
  await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(userData).returning();
    await tx.insert(profiles).values({ userId: user.id, ...profileData });
  });
} catch (error) {
  if (error instanceof DrizzleQueryError) {
    console.error('Transaction failed:', error.message);
    console.error('Query:', error.query);
  }
  throw error;
}
```
