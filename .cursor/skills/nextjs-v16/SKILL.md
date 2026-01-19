---
name: Next.js 16 App Router
description: |
  Next.js 16 App Router patterns - pages, API routes, server components, client components, middleware.
  
  Use when: building Next.js 16 applications with App Router.
---

# Skill: nextjs

## Scope

- Applies to: Next.js 16 App Router - Server Components, Client Components, API routes, Server Actions, middleware, caching
- Does NOT cover: Pages Router, deployment specifics, framework internals

## Assumptions

- Next.js 16+
- Node.js 20.9+
- TypeScript 5.1+
- React 19+ (for full feature support)
- Turbopack (stable, default bundler)

## Principles

- Use Server Components by default (async/await directly in components)
- Use Client Components (`'use client'`) only for interactivity (hooks, event handlers)
- Use Server Actions for mutations (`'use server'`)
- Use `use cache` directive for explicit component-level caching (Next.js 16)
- Use `revalidatePath` and `revalidateTag` for cache invalidation
- Use Suspense boundaries for async data loading
- Use `useTransition` for non-urgent updates
- Use `useDeferredValue` for deferring expensive computations
- Route handlers use `route.ts` files with named exports (`GET`, `POST`, etc.)

## Constraints

### MUST

- Use Server Components by default (no `'use client'` unless needed)
- Mark Server Actions with `'use server'` directive
- Use `revalidatePath` or `revalidateTag` after mutations
- Handle `searchParams` as Promise in Server Components (Next.js 15+)

### SHOULD

- Use `useTransition` for heavy updates that shouldn't block UI
- Use `useDeferredValue` with `useMemo` only for expensive operations (1000+ items)
- Use Suspense boundaries for progressive loading
- Use route groups `(group)` for organization without affecting URLs

### AVOID

- Unnecessary `useMemo`/`useCallback` (React 19 handles most optimizations)
- Client Components for static content
- Mixing Server and Client Component patterns incorrectly
- React Compiler (wait for better ecosystem support)

## Interactions

- Works with [drizzle-orm](@cursor/skills/drizzle-orm-v0/SKILL.md) for database access
- Complements [ai-sdk-ui](@cursor/skills/ai-sdk-ui-v6/SKILL.md) for chat interfaces
- Uses [typescript](@cursor/skills/typescript-v5/SKILL.md) for type safety

## Patterns

### Server Component

```tsx
// app/page.tsx
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### Client Component

```tsx
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Server Action

```tsx
'use server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  await createItemInDB(formData)
  revalidatePath('/items')
}
```

### Route Handler

```tsx
// app/api/items/route.ts
export async function GET() {
  return Response.json({ items: [] })
}

export async function POST(request: Request) {
  const data = await request.json()
  return Response.json({ created: data })
}
```

### Caching

```tsx
'use cache'
export async function CachedComponent() {
  const data = await fetchData() // Cached at component level
  return <div>{data}</div>
}
```

## References

- [Next.js Documentation](https://nextjs.org/docs) - Complete App Router guide
- [React Server Components](https://react.dev/reference/rsc/server-components) - Server Component patterns
