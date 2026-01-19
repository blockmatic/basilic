---
name: Drizzle PostgreSQL
description: |
  Drizzle ORM for TypeScript - type-safe SQL queries, schema definitions, migrations, and relations.
  
  Use when: building database layers in Next.js or Node.js applications.
---

# Skill: drizzle-orm

## Scope

- Applies to: Drizzle ORM v0 for PostgreSQL, MySQL, SQLite - schema definitions, type-safe queries, migrations, relations
- Does NOT cover: Database drivers setup, migration tooling details, other ORMs

## Assumptions

- Drizzle ORM v0+
- Drizzle Kit (dev dependency) for migrations
- PostgreSQL, MySQL, or SQLite database
- TypeScript v5+ with strict mode

## Principles

- Define schemas using `pgTable`, `text`, `varchar`, `timestamp`, etc.
- Use query helpers (`eq`, `and`, `or`, `like`, etc.) for type-safe queries
- Use `select()`, `insert()`, `update()`, `delete()` for CRUD operations
- Use `relations()` for defining relationships
- Use `db.transaction()` for atomic operations
- Generate migrations with `drizzle-kit generate`
- Use `$inferSelect` and `$inferInsert` for type inference

## Constraints

### MUST

- Use Drizzle Kit for migrations (`drizzle-kit generate`, `drizzle-kit migrate`)
- Define schemas with proper column types and constraints
- Use query helpers instead of raw SQL when possible

### SHOULD

- Use relations for type-safe joins
- Use transactions for multi-step operations
- Use prepared statements for frequently executed queries
- Export types using `$inferSelect` and `$inferInsert`

### AVOID

- Raw SQL unless necessary (use query helpers)
- Manual type assertions (use inferred types)
- Skipping migration generation

## Interactions

- Works with [nextjs](@cursor/skills/nextjs-v16/SKILL.md) Server Components and API routes
- Complements [fastify](@cursor/skills/fastify-v5/SKILL.md) for API development

## Patterns

### Schema Definition

```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### Query Pattern

```typescript
import { eq } from 'drizzle-orm'

const user = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1)
```

### Transaction Pattern

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values(userData).returning()
  await tx.insert(profiles).values({ userId: user.id, ...profileData })
})
```

See [Query Patterns](references/queries.md) and [PostgreSQL Patterns](references/postgresql-patterns.md) for detailed examples.

## References

- [Query Patterns](references/queries.md) - CRUD operations, joins, aggregations
- [PostgreSQL Patterns](references/postgresql-patterns.md) - PostgreSQL-specific patterns
