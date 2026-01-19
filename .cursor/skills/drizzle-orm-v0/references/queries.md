# Drizzle ORM Queries Reference

## Select Queries

### Basic Select

```typescript
import { db } from '@/db'
import { users } from '@/db/schema'

// Select all
const allUsers = await db.select().from(users)

// Select specific columns
const names = await db.select({ name: users.name }).from(users)
```

### Where Clauses

```typescript
import { eq, ne, gt, lt, gte, lte, like, ilike, and, or, not, isNull, isNotNull, inArray, between } from "drizzle-orm";

// Equals
const user = await db.select().from(users).where(eq(users.id, "123"));

// Not equals
const others = await db.select().from(users).where(ne(users.id, "123"));

// Greater than / Less than
const recent = await db.select().from(posts).where(gt(posts.createdAt, date));

// AND condition
const activeTasks = await db
  .select()
  .from(tasks)
  .where(and(eq(tasks.userId, userId), eq(tasks.completed, false)));

// OR condition
const filteredTasks = await db
  .select()
  .from(tasks)
  .where(or(eq(tasks.status, "pending"), eq(tasks.status, "in_progress")));

// LIKE (case-sensitive)
const matching = await db.select().from(users).where(like(users.name, "%john%"));

// ILIKE (case-insensitive)
const matchingInsensitive = await db
  .select()
  .from(users)
  .where(ilike(users.name, "%john%"));

// NULL checks
const withoutBio = await db.select().from(users).where(isNull(users.bio));
const withBio = await db.select().from(users).where(isNotNull(users.bio));

// IN array
const specificUsers = await db
  .select()
  .from(users)
  .where(inArray(users.role, ["admin", "moderator"]));

// BETWEEN
const lastWeek = await db
  .select()
  .from(posts)
  .where(between(posts.createdAt, startDate, endDate));
```

### Order By

```typescript
import { asc, desc } from 'drizzle-orm'

// Ascending
const oldest = await db.select().from(posts).orderBy(asc(posts.createdAt))

// Descending
const newest = await db.select().from(posts).orderBy(desc(posts.createdAt))

// Multiple columns
const sorted = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.featured), desc(posts.createdAt))
```

### Limit & Offset

```typescript
// Pagination
const page = 1
const pageSize = 10

const posts = await db
  .select()
  .from(posts)
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

### Joins

```typescript
import { eq } from "drizzle-orm";

// Inner join
const postsWithUsers = await db
  .select({
    post: posts,
    author: users,
  })
  .from(posts)
  .innerJoin(users, eq(posts.userId, users.id));

// Left join
const postsWithOptionalUsers = await db
  .select()
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id));
```

### Aggregations

```typescript
import { count, sum, avg, min, max } from "drizzle-orm";

// Count
const totalPosts = await db.select({ count: count() }).from(posts);

// Count with condition
const publishedCount = await db
  .select({ count: count() })
  .from(posts)
  .where(eq(posts.published, true));

// Sum
const totalViews = await db.select({ total: sum(posts.views) }).from(posts);

// Average
const avgViews = await db.select({ average: avg(posts.views) }).from(posts);

// Group by
const postsByUser = await db
  .select({
    userId: posts.userId,
    count: count(),
  })
  .from(posts)
  .groupBy(posts.userId);
```

## Query Builder (Relational)

For complex queries with relations, use the query builder:

```typescript
// Find many with relations
const postsWithComments = await db.query.posts.findMany({
  with: {
    comments: true,
    author: true,
  },
});

// Find one
const post = await db.query.posts.findFirst({
  where: eq(posts.id, postId),
  with: {
    comments: {
      with: {
        author: true,
      },
    },
  },
});

// With filtering on relations
const activeUsersWithPosts = await db.query.users.findMany({
  where: eq(users.active, true),
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: desc(posts.createdAt),
      limit: 5,
    },
  },
});
```

## Insert Queries

```typescript
// Insert one
const [newUser] = await db
  .insert(users)
  .values({
    email: "user@example.com",
    name: "John",
  })
  .returning();

// Insert many
const newPosts = await db
  .insert(posts)
  .values([
    { title: "Post 1", userId: user.id },
    { title: "Post 2", userId: user.id },
  ])
  .returning();

// Insert with conflict handling (upsert)
await db
  .insert(users)
  .values({ id: "123", email: "new@example.com" })
  .onConflictDoUpdate({
    target: users.id,
    set: { email: "new@example.com" },
  });

// Insert ignore on conflict
await db
  .insert(users)
  .values({ email: "existing@example.com" })
  .onConflictDoNothing();
```

## Update Queries

```typescript
// Update with where
const [updated] = await db
  .update(posts)
  .set({
    title: "New Title",
    updatedAt: new Date(),
  })
  .where(eq(posts.id, postId))
  .returning();

// Update multiple rows
await db
  .update(tasks)
  .set({ completed: true })
  .where(and(eq(tasks.userId, userId), eq(tasks.status, "done")));
```

## Delete Queries

```typescript
// Delete with where
await db.delete(posts).where(eq(posts.id, postId));

// Delete with returning
const [deleted] = await db
  .delete(posts)
  .where(eq(posts.id, postId))
  .returning();

// Delete multiple
await db.delete(tasks).where(eq(tasks.completed, true));
```

## Raw SQL

```typescript
import { sql } from "drizzle-orm";

// Raw SQL in select
const result = await db.execute(
  sql`SELECT * FROM users WHERE email = ${email}`
);

// Raw SQL in where
const posts = await db
  .select()
  .from(posts)
  .where(sql`${posts.views} > 100`);

// Raw SQL column
const postsWithRank = await db
  .select({
    id: posts.id,
    title: posts.title,
    rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${posts.views} DESC)`,
  })
  .from(posts);
```

## Prepared Statements

```typescript
import { placeholder } from "drizzle-orm";

const getUserByEmail = db
  .select()
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .prepare("get_user_by_email");

// Execute with parameters
const user = await getUserByEmail.execute({ email: "user@example.com" });
```

## Error Handling (v0.44+)

Drizzle ORM v0.44+ introduces `DrizzleQueryError` for structured error handling:

```typescript
import { DrizzleQueryError } from "drizzle-orm";

// Basic error handling
try {
  const user = await db.select().from(users).where(eq(users.id, userId));
} catch (error) {
  if (error instanceof DrizzleQueryError) {
    // Access structured error information
    console.error("Database error:", error.message);
    console.error("Query:", error.query);
    console.error("Cause:", error.cause);
    
    // Handle specific error types
    if (error.cause?.code === "23505") {
      // Unique constraint violation
      throw new Error("User already exists");
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
    // Transaction errors are wrapped with context
    console.error("Transaction failed:", error.message);
    console.error("Failed query:", error.query);
  }
  throw error;
}

// Error handling helper function
async function safeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    if (error instanceof DrizzleQueryError) {
      // Log structured error information
      console.error("Query error:", {
        message: error.message,
        query: error.query,
        cause: error.cause,
      });
      // Re-throw with user-friendly message
      throw new Error(`Database operation failed: ${error.message}`);
    }
    throw error;
  }
}

// Usage
const user = await safeQuery(() =>
  db.select().from(users).where(eq(users.id, userId))
);
```
