---
title: Call `revalidateTag(tag, cacheLife)` with a profile — never invoke the old one-arg API
impact: CRITICAL
impactDescription: enables stale-while-revalidate so users see cached content while the new fetch lands in background; the old single-arg call no longer works in Next.js 16
tags: cache, revalidate-tag, cache-life-profile, swr
---

## Call `revalidateTag(tag, cacheLife)` with a profile — never invoke the old one-arg API

**Pattern intent:** Next.js 16's `revalidateTag` requires a `cacheLife` profile as the second argument — for example `'max'`, `'hours'`, or `'days'`, any other built-in or custom profile name from your `cacheLife` config, or `{ expire: number }` (seconds). The profile controls stale-while-revalidate. One-arg form is deprecated.

### Shapes to recognize

- `revalidateTag('products')` with no second arg — the Next.js 15 API still in the codebase post-upgrade.
- A migrated codebase where some calls have profiles and others don't — inconsistent stale-while-revalidate behavior across the app.
- Workaround: a `revalidatePath` call where the author meant tag-based invalidation — coarser than needed, more cache miss.
- A Server Action that mutates and calls `revalidateTag` with no `'max'` profile when the user must see fresh data immediately — leaks stale content into the post-mutation render.
- A code review comment ("we should pick a cacheLife here") followed by the author hardcoding `revalidate: 0` instead — sidesteps the API.

The canonical resolution: `revalidateTag(tag, profile)` where profile is a `cacheLife` name (e.g. `'max'`, `'hours'`, `'days'`, or a custom profile) or `{ expire: number }`. `'max'` is stale-while-revalidate (serve cached, refresh in background) — not read-your-writes. For forms where the user must see the write immediately, call `updateTag(tag)` from a Server Action ([Next.js 16 blog](https://nextjs.org/blog/next-16)).

Reference: [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components), [Caching without Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)

**Incorrect (old revalidateTag API):**

```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: FormData) {
  await db.products.update({ where: { id }, data })

  // Old API - no longer works in Next.js 16
  revalidateTag('products')
}
```

**Correct (revalidateTag with cacheLife):**

```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: FormData) {
  await db.products.update({ where: { id }, data })

  // New API with cacheLife profile
  revalidateTag('products', 'hours')
}

// Profiles: 'max' | 'hours' | 'days' | { expire: seconds }
// 'max' = SWR (serve stale, revalidate in background)
// Read-your-writes in a Server Action: updateTag('products')
```

**Tagging cached data (previous model):**

```typescript
const data = await fetch('https://api.store.com/products', {
  next: { tags: ['products'], revalidate: 3600 },
})
```

**Tagging cached data (Cache Components — requires `cacheComponents: true`):**

```typescript
'use cache'

import { cacheTag } from 'next/cache'

export async function getProducts() {
  cacheTag('products')
  const res = await fetch('https://api.store.com/products')
  return res.json()
}
```

Reference: [Next.js 16 Caching](https://nextjs.org/docs/app/building-your-application/caching)
