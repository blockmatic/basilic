---
name: Next.js 16 App Router
description: |
  Next.js 16 App Router patterns - pages, API routes, server components, client components, middleware.
  
  Use when: building Next.js 16 applications with App Router.
---

# Next.js 16 App Router Patterns

## Requirements

- **Node.js**: 20.9+ required
- **TypeScript**: 5.1+ required
- **React**: 19+ for full feature support
- **Turbopack**: Stable and default bundler (10× faster Fast Refresh with file system caching in beta)

## File Structure

```
app/
├── layout.tsx              # Root layout (required)
├── page.tsx                # Home page (/)
├── loading.tsx             # Loading UI
├── error.tsx               # Error boundary
├── not-found.tsx           # 404 page
├── globals.css             # Global styles
├── environments/
│   ├── page.tsx            # /environments
│   ├── [id]/
│   │   ├── page.tsx        # /environments/[id]
│   │   └── loading.tsx     # Loading for this route
│   └── new/
│       └── page.tsx        # /environments/new
├── api/
│   └── environments/
│       ├── route.ts        # GET/POST /api/environments
│       └── [id]/
│           └── route.ts    # GET/PUT/DELETE /api/environments/[id]
└── (auth)/                 # Route group (no URL impact)
    ├── login/
    │   └── page.tsx
    └── layout.tsx          # Shared auth layout
```

## Server Components (Default)

```tsx
// app/environments/page.tsx
// Server Component - can use async/await directly
import { getEnvironments } from '@/lib/api'

export default async function EnvironmentsPage() {
  const environments = await getEnvironments()

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Environments</h1>
      <EnvironmentList environments={environments} />
    </main>
  )
}

// With search params
export default async function EnvironmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const environments = await getEnvironments({
    status: params.status,
    page: parseInt(params.page || '1'),
  })

  return <EnvironmentList environments={environments} />
}
```

## use cache Directive

Next.js 16 introduces the `use cache` directive for explicit caching at component or function level.

### Component-Level Caching

```tsx
// app/dashboard/stats.tsx
'use cache'

import { getStats } from '@/lib/api'

export async function DashboardStats() {
  const stats = await getStats()
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Users" value={stats.users} />
      <StatCard title="Revenue" value={stats.revenue} />
      <StatCard title="Orders" value={stats.orders} />
    </div>
  )
}
```

### Function-Level Caching with cacheLife

```tsx
// lib/api.ts
'use cache'
export async function getProductList() {
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

// With cacheLife profiles
'use cache'
import { cacheLife } from 'next/cache'

export async function getUserData(userId: string) {
  cacheLife('max') // Cache for maximum duration
  const res = await fetch(`/api/users/${userId}`)
  return res.json()
}

export async function getRecentPosts() {
  cacheLife('hours') // Cache for hours
  const res = await fetch('/api/posts/recent')
  return res.json()
}

export async function getDailyDeals() {
  cacheLife('days') // Cache for days
  const res = await fetch('/api/deals/daily')
  return res.json()
}

// Custom cache lifetime
export async function getWeatherData(location: string) {
  cacheLife({
    stale: 3600, // Serve stale data for 1 hour
    revalidate: 7200, // Revalidate after 2 hours
    expire: 86400, // Expire after 24 hours
  })
  const res = await fetch(`/api/weather/${location}`)
  return res.json()
}
```

### Partial Page Caching

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  return (
    <div>
      <Header /> {/* Static, always rendered */}
      <ProductList /> {/* Cached with 'use cache' */}
      <RecentActivity /> {/* Dynamic, not cached */}
    </div>
  )
}

// components/ProductList.tsx
'use cache'
import { getProducts } from '@/lib/api'
import { cacheLife } from 'next/cache'

export async function ProductList() {
  cacheLife('hours')
  const products = await getProducts()
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## Client Components

```tsx
// components/EnvironmentActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EnvironmentActions({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsLoading(true)
    try {
      await fetch(`/api/environments/${id}`, { method: 'DELETE' })
      router.refresh() // Refresh server components
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="btn btn-danger"
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

## API Route Handlers

```tsx
// app/api/environments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateEnvironmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

// GET /api/environments
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  const environments = await prisma.environment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(environments)
}

// POST /api/environments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateEnvironmentSchema.parse(body)

    const environment = await prisma.environment.create({
      data: {
        name: data.name,
        description: data.description,
        status: 'PENDING',
      },
    })

    return NextResponse.json(environment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}

// app/api/environments/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const environment = await prisma.environment.findUnique({
    where: { id },
  })

  if (!environment) {
    return NextResponse.json(
      { error: 'Environment not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(environment)
}
```

## Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
```

## NextAuth.js Integration

```tsx
// lib/auth.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})

// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

## Server Actions

```tsx
// app/environments/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { cacheLife } from 'next/cache'

const CreateSchema = z.object({
  name: z.string().min(1),
})

export async function createEnvironment(formData: FormData) {
  const data = CreateSchema.parse({
    name: formData.get('name'),
  })

  await prisma.environment.create({
    data: { name: data.name, status: 'PENDING' },
  })

  revalidatePath('/environments')
  redirect('/environments')
}

// Usage in component
import { createEnvironment } from './actions'

export function CreateForm() {
  return (
    <form action={createEnvironment}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Loading & Error States

```tsx
// app/environments/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}

// app/environments/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

## Data Fetching Patterns

### Basic Fetch with cacheLife

```tsx
// lib/api.ts
const API_URL = process.env.FACADE_URL || 'http://localhost:1337'

export async function getEnvironments() {
  const res = await fetch(`${API_URL}/api/v1/environments`, {
    next: { 
      revalidate: 60, // ISR: revalidate every 60 seconds
      tags: ['environments'], // Tag for cache invalidation
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch environments')
  }

  return res.json()
}

export async function getEnvironment(id: string) {
  const res = await fetch(`${API_URL}/api/v1/environments/${id}`, {
    cache: 'no-store', // Always fresh
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch environment')
  }

  return res.json()
}
```

### Cache Invalidation APIs

```tsx
// app/environments/actions.ts
'use server'

import { revalidateTag, updateTag, cacheLife } from 'next/cache'

// v16: revalidateTag requires cacheLife
export async function updateEnvironment(id: string, data: any) {
  await prisma.environment.update({
    where: { id },
    data,
  })

  // Revalidate with cacheLife
  revalidateTag('environments', {
    cacheLife: {
      stale: 3600, // 1 hour
      revalidate: 7200, // 2 hours
      expire: 86400, // 24 hours
    },
  })
}

// v16: New updateTag API for immediate invalidation
export async function deleteEnvironment(id: string) {
  await prisma.environment.delete({
    where: { id },
  })

  // Immediate invalidation (no cacheLife needed)
  updateTag('environments')
}

// v16: New refresh() API for refreshing uncached data
import { refresh } from 'next/cache'

export async function refreshDashboard() {
  // Refresh uncached/dynamic content
  refresh()
}
```

### cacheLife in fetch Options

```tsx
// lib/api.ts
import { cacheLife } from 'next/cache'

export async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: {
      cacheLife: 'hours', // Use cacheLife profile
      tags: ['products'],
    },
  })

  return res.json()
}

export async function getUserProfile(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    next: {
      cacheLife: {
        stale: 300, // 5 minutes
        revalidate: 600, // 10 minutes
        expire: 3600, // 1 hour
      },
      tags: ['user', userId],
    },
  })

  return res.json()
}
```

## Parallel Data Fetching

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch in parallel
  const [environments, users, metrics] = await Promise.all([
    getEnvironments(),
    getUsers(),
    getMetrics(),
  ])

  return (
    <Dashboard
      environments={environments}
      users={users}
      metrics={metrics}
    />
  )
}
```
