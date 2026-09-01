---
title: Every Server Action that writes data must invalidate the routes/tags that surface that data
impact: MEDIUM
impactDescription: ensures users see their own writes immediately; without invalidation, mutations appear to silently no-op until the next cache expiry
tags: action, revalidation, post-mutation-invalidate, cache-pair
---

## Every Server Action that writes data must invalidate the routes/tags that surface that data

**Pattern intent:** mutation + invalidation form a transaction in the user's mental model. An action without a paired invalidation leaves the user looking at stale data with no error to debug.

### Shapes to recognize

- A `'use server'` action with `await db.x.create(...)` and no `revalidatePath`/`revalidateTag` call — user sees no change until cache expires.
- A bug report of the form "Created the thing — refresh, still not there" — almost always a missing invalidation in the action.
- An action that calls `revalidatePath('/foo')` but the data also surfaces on `/bar` and `/baz` — under-invalidation.
- An action that calls `revalidatePath('/', 'layout')` for a small mutation — nukes everyone's cache; should be more targeted.
- An action that returns `{ success: true }` and the *client* triggers `router.refresh()` afterward — works but loses the server-driven invalidation guarantee.
- A `redirect()` called *before* `revalidatePath` — `redirect` throws internally; the invalidation never runs.

The canonical resolution: after the write succeeds, call `revalidateTag(tag, cacheLife)` (preferred for granular control) or `revalidatePath(path)` (coarser), *then* `redirect(...)`. Use `updateTag(tag)` when the user must see the write immediately (read-your-writes). Use `refresh()` from a Server Action when only uncached data elsewhere on the page must update — `refresh()` is only valid inside Server Actions and throws when called elsewhere.

**Incorrect (stale cache after mutation):**

```typescript
'use server'

export async function deletePost(postId: string) {
  await db.posts.delete({ where: { id: postId } })
  redirect('/posts')
  // Posts list still shows deleted post from cache!
}
```

**Correct (invalidating cache):**

```typescript
'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePost(postId: string) {
  await db.posts.delete({ where: { id: postId } })

  revalidatePath('/posts')
  revalidateTag('posts', 'max')

  redirect('/posts')
}

export async function updatePost(postId: string, formData: FormData) {
  await db.posts.update({
    where: { id: postId },
    data: { title: formData.get('title') },
  })

  // Cached fetch must use the same tag (e.g. in getPost):
  // fetch(`/api/posts/${postId}`, { next: { tags: [`post-${postId}`] } })

  // Read-your-writes: user sees the edit immediately
  updateTag(`post-${postId}`)
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
}
```

**Revalidation strategies:**

```typescript
// Specific route
revalidatePath('/posts')

// Dynamic route with specific ID
revalidatePath(`/posts/${postId}`)

// All routes using a layout
revalidatePath('/dashboard', 'layout')

// By cache tag (stale-while-revalidate)
revalidateTag('posts', 'max')

// Read-your-writes in a Server Action
updateTag(`post-${postId}`)

// Refresh uncached data only (Server Actions only — throws elsewhere)
'use server'

import { refresh } from 'next/cache'

export async function refreshHeaderCount() {
  refresh()
}
```
