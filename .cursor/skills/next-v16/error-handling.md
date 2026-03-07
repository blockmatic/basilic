# Error Handling

Handle errors in Next.js with the **`@repo/error` package** (Sentry-backed) and **structured logging** (`@repo/utils/logger/server` or `@repo/utils/logger/client`).

Reference: https://nextjs.org/docs/app/getting-started/error-handling

## Observability (Required)

- Report unexpected errors with `captureError` from `@repo/error/nextjs`
- Log operational context with `logger` from `@repo/utils/logger/server` or `@repo/utils/logger/client` (never `console.*`)

## Error Boundaries

### `error.tsx`

Catches errors in a route segment and its children:

```tsx
'use client'

import { captureError } from '@repo/error/nextjs'
import { logger } from '@repo/utils/logger/client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError({
      code: 'UNEXPECTED_ERROR',
      error,
      label: 'Next.js error.tsx',
      tags: { runtime: 'nextjs' },
      data: { digest: error.digest },
    })
    logger.error({ error, digest: error.digest }, 'Unhandled error in route segment')
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

**Important:** `error.tsx` must be a Client Component.

### `global-error.tsx`

Catches errors in the root layout. Same capture pattern as `error.tsx`, but it **must** render `<html>` and `<body>`:

```tsx
'use client'

import { captureError } from '@repo/error/nextjs'
import { logger } from '@repo/utils/logger/client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError({ error, label: 'Next.js global-error.tsx', code: 'UNEXPECTED_ERROR', data: { digest: error.digest } })
    logger.error({ error, digest: error.digest }, 'Unhandled error in root layout')
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

**Important:** Must include `<html>` and `<body>` tags.

## Navigation APIs + `try/catch` (Critical)

`redirect()`, `permanentRedirect()`, `notFound()`, `forbidden()`, and `unauthorized()` throw special errors that Next.js handles internally. If you catch broadly, you must re-throw them.

Reference: https://nextjs.org/docs/app/api-reference/functions/redirect#behavior

```tsx
'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { captureError } from '@repo/error/nextjs'
import { logger } from '@repo/utils/logger/server'

export async function action() {
  try {
    // ...
    redirect('/success') // throws
  } catch (error) {
    unstable_rethrow(error)
    captureError({ error, label: 'Server action', code: 'UNEXPECTED_ERROR' })
    logger.error({ error }, 'Server action failed')
    return { ok: false as const }
  }
}
```

## Server Actions & Route Handlers (Pattern)

Capture, log, then return a safe result. If navigation APIs may be involved, call `unstable_rethrow(error)` first.

```tsx
import { unstable_rethrow } from 'next/navigation'
import { captureError } from '@repo/error/nextjs'
import { logger } from '@repo/utils/logger/server'

async function action() {
  try {
    // ...
    return { ok: true as const }
  } catch (error) {
    unstable_rethrow(error)
    captureError({ error, label: 'Route handler / server action', code: 'UNEXPECTED_ERROR' })
    logger.error({ error }, 'Request failed')
    return { ok: false as const }
  }
}
```

## Auth Errors

Trigger auth-related error pages:

```tsx
import { forbidden, unauthorized } from 'next/navigation'

async function Page() {
  const session = await getSession()

  if (!session) {
    unauthorized() // Renders unauthorized.tsx (401)
  }

  if (!session.hasAccess) {
    forbidden() // Renders forbidden.tsx (403)
  }

  return <Dashboard />
}
```

Create corresponding error pages:

```tsx
// app/forbidden.tsx
export default function Forbidden() {
  return <div>You don't have access to this resource</div>
}

// app/unauthorized.tsx
export default function Unauthorized() {
  return <div>Please log in to continue</div>
}
```

## Not Found

### `not-found.tsx`

Custom 404 page for a route segment:

```tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  )
}
```

### Triggering Not Found

```tsx
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()  // Renders closest not-found.tsx
  }

  return <div>{post.title}</div>
}
```

## Error Hierarchy

Errors bubble up to the nearest error boundary:

```
app/
├── error.tsx           # Catches errors from all children
├── blog/
│   ├── error.tsx       # Catches errors in /blog/*
│   └── [slug]/
│       ├── error.tsx   # Catches errors in /blog/[slug]
│       └── page.tsx
└── layout.tsx          # Errors here go to global-error.tsx
```
