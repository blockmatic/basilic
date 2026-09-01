---
title: Opt into cache explicitly — `'use cache'` only when Cache Components is on; otherwise fetch options / unstable_cache
impact: CRITICAL
impactDescription: `'use cache'` is a Cache Components feature; emitting it with cacheComponents off is a Next 16 anti-pattern
tags: cache, use-cache-directive, cache-components, force-cache, unstable-cache
---

## Opt into cache explicitly — `'use cache'` only when Cache Components is on

**Pattern intent:** `fetch` is not cached by default. Caching is opt-in. Which API you use depends on `cacheComponents` in `next.config`. `'use cache'` / `cacheLife` / `cacheTag` require `cacheComponents: true` ([use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)). Without that flag, use `cache: 'force-cache'`, `next: { revalidate, tags }`, or `unstable_cache` ([previous model](https://nextjs.org/docs/app/guides/caching-without-cache-components)).

### Shapes to recognize

- `'use cache'` in an app whose `next.config` does not set `cacheComponents: true`.
- A Server Component `fetch(url)` with no `cache` / `next.revalidate` / `'use cache'` where the data should be cached.
- A hand-rolled module-level `Map` cache instead of the platform API for that model.
- Enabling `cacheComponents` while still exporting `dynamic` / `revalidate` / `fetchCache` (those segment configs error under Cache Components).

**Canonical resolution:**

1. Read `cacheComponents` in `next.config`.
2. Flag off: `fetch(..., { cache: 'force-cache' })` or `next: { revalidate: N, tags }`, or `unstable_cache`.
3. Flag on: `'use cache'` on the async function/component, plus `cacheLife` / `cacheTag`. Do not keep route segment cache configs.

Reference: [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache), [Caching without Cache Components](https://nextjs.org/docs/app/guides/caching-without-cache-components)

**Incorrect (relying on implicit caching):**

```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  // No cache option — uncached on every request (both Next 16 models)
  const products = await fetch('https://api.store.com/products')

  return <ProductList products={products} />
}
```

**Correct (Cache Components off — previous model):**

```typescript
export default async function ProductsPage() {
  const products = await fetch('https://api.store.com/products', {
    next: { revalidate: 3600 },
  })
  return <ProductList products={products} />
}
```

**Correct (Cache Components on — `'use cache'`):**

```typescript
// next.config: cacheComponents: true
// app/products/page.tsx
'use cache'

export default async function ProductsPage() {
  const products = await fetch('https://api.store.com/products')
  return <ProductList products={products} />
}
```

**Alternative (cache specific functions):**

```typescript
// lib/data.ts
import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async () => {
    const res = await fetch('https://api.store.com/products')
    return res.json()
  },
  ['products'],
  { revalidate: 3600 }  // Cache for 1 hour
)
```

---

### In disguise — a hand-rolled module-level cache mimicking `'use cache'`

The grep-friendly anti-pattern is a `fetch(...)` with no cache annotation in a Server Component. The disguise is a *custom* caching layer (module-level `Map`, in-memory dictionary, ad-hoc TTL) introduced "to fix" the per-request fetching. It works for one request lifecycle but doesn't integrate with `revalidateTag`, can't survive a server restart cleanly, and competes with the platform's caching primitive.

**Incorrect — in disguise (hand-rolled cache layer):**

```typescript
// lib/cache.ts — homemade caching
const productsCache = new Map<string, { data: Product[]; expires: number }>()

export async function getProducts(category: string): Promise<Product[]> {
  const cached = productsCache.get(category)
  if (cached && cached.expires > Date.now()) return cached.data

  const res = await fetch(`https://api.store.com/products?category=${category}`)
  const data = await res.json()
  productsCache.set(category, { data, expires: Date.now() + 1000 * 60 * 5 })
  return data
}
```

Works locally, breaks in production: no shared state across server instances, no integration with `revalidateTag('products')`, no SWR semantics. On every server restart, the cache is cold.

**Correct — `unstable_cache` with tagging:**

```typescript
// lib/products.ts
import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async (category: string) => {
    const res = await fetch(`https://api.store.com/products?category=${category}`)
    return res.json() as Promise<Product[]>
  },
  ['products-by-category'],
  { tags: ['products'], revalidate: 300 }
)
```

Now `revalidateTag('products', 'max')` invalidates across all server instances. The audit can find this and the framework knows about it.

Final reference: [Next.js 16 Cache Components](https://nextjs.org/blog/next-16)
