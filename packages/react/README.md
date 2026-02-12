# @repo/react

Provides React Query hooks for `@repo/core` API functions.

## Overview

This package provides React Query hooks that wrap `@repo/core` API client methods. All types are imported from `@repo/core`, ensuring a single source of truth for API types and eliminating duplication.

## Exports

- `ReactApiProvider` - Provider component that makes API client available to hooks
- `useReactApiConfig` - Hook to access API client and query defaults from context
- `useHealthCheck` - React Query hook for health check endpoint
- `useMagicLink` - React Query mutation hook for magic link request endpoint
- `LoginForm` - Framework-agnostic login form component
- `createReactApiConfig` - Utility function to normalize API configuration

## Usage

### Next.js Integration

#### Configuration

Add `@repo/react` and `@repo/core` to `transpilePackages` in your `next.config.mjs` and configure webpack to resolve `.js` imports to `.ts` files:

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/core', '@repo/react', '@repo/sentry', '@repo/utils'],
  webpack: config => {
    // Resolve .js imports to .ts files for transpiled packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.jsx': ['.tsx', '.jsx'],
    }
    return config
  },
}

export default nextConfig
```

**Note**: If you're using Turbopack (Next.js 16+ default), you may need to use the `--webpack` flag when building (`pnpm build --webpack`), or configure Turbopack accordingly. The webpack configuration ensures proper resolution of `.js` imports to `.ts` files in transpiled packages.

#### Setup Provider

Create a client component provider (e.g., `app/components/providers.tsx`):

```tsx
'use client'

import { createClient } from '@repo/core'
import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Create clients at module level (singleton pattern)
const queryClient = new QueryClient()

const coreClient = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactApiProvider client={coreClient}>
        {children}
      </ReactApiProvider>
    </QueryClientProvider>
  )
}
```

Wrap your app in `app/layout.tsx`:

```tsx
import { Providers } from './components/providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### Using Components

Components from `@repo/react` (like `LoginForm`) are client components and can be used directly in your pages:

```tsx
// app/login/page.tsx
import { LoginForm } from '@repo/react'

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
    </div>
  )
}
```

#### Using Hooks

Hooks must be used in client components. Mark components with `'use client'`:

```tsx
// app/components/health-status.tsx
'use client'

import { useHealthCheck } from '@repo/react'

export function HealthStatus() {
  const { data, isLoading } = useHealthCheck()
  
  if (isLoading) return <div>Loading...</div>
  return <div>Server status: {data?.datetime}</div>
}
```

### General Setup

Wrap your app with `QueryClientProvider` and `ReactApiProvider`:

```tsx
import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@repo/core'

const queryClient = new QueryClient()

// Create core client instance with authentication
const coreClient = createClient({
  baseUrl: 'https://api.example.com',
  getAuthToken: async () => {
    // Get access token from storage
    return localStorage.getItem('accessToken')
  },
  getRefreshToken: async () => {
    // Get refresh token from storage
    return localStorage.getItem('refreshToken')
  },
  onTokensRefreshed: async ({ token, refreshToken }) => {
    // Update tokens in storage
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refreshToken)
  },
  getHeaders: async () => ({ 'X-Custom': 'value' }),
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactApiProvider
        client={coreClient}
        queryClientDefaults={{
          retry: 3,
          staleTime: 5 * 60 * 1000, // 5 minutes
        }}
      >
        <MyComponent />
      </ReactApiProvider>
    </QueryClientProvider>
  )
}
```

### Using Hooks

Hooks are fully typed using types from `@repo/core`. All standard TanStack Query options are supported, including the ability to override the default `queryKey`.

```tsx
import { useHealthCheck } from '@repo/react'

function MyComponent() {
  // Hook uses core client instance directly
  // data is fully typed from @repo/core types
  const { data, isLoading, error } = useHealthCheck()
  
  // Hooks support params that the core client function supports
  const { data: healthData } = useHealthCheck({ query: { include: 'details' } })
  
  // Override query options per hook
  const { data: refetchData } = useHealthCheck(
    undefined,
    { refetchInterval: 30000 }
  )
  
  // Override queryKey for custom caching behavior
  const { data: customData } = useHealthCheck(
    undefined,
    { queryKey: ['custom-health-check'] }
  )
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>Server status: {data?.now}</div>
}
```

### Creating Custom Hooks

You can create custom hooks for other API endpoints by following this pattern:

```tsx
import type { EndpointData, EndpointResponse } from '@repo/core'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useReactApiConfig } from '@repo/react'

export function useEndpoint(
  params?: EndpointData,
  options?: Omit<UseQueryOptions<EndpointResponse, Error>, 'queryFn'>,
) {
  const { client, queryClientDefaults } = useReactApiConfig()
  return useQuery<EndpointResponse, Error>({
    queryKey: ['endpoint', params],
    queryFn: async () => {
      return (await client.endpoint(params)) as unknown as EndpointResponse
    },
    ...queryClientDefaults,
    ...options,
  })
}
```

### Accessing API Client

Use `useReactApiConfig` to access the API client directly:

```tsx
import { useReactApiConfig } from '@repo/react'

function CustomHook() {
  const { client, queryClientDefaults } = useReactApiConfig()
  
  // Use client directly for custom logic
  const customOperation = async () => {
    const result = await client.auth.magiclink.request({ body: { email } })
    return result
  }
  
  return { customOperation }
}
```

### Query Client Defaults

Configure default query options that apply to all hooks:

```tsx
<ReactApiProvider
  client={coreClient}
  queryClientDefaults={{
    retry: 3, // Retry failed requests 3 times
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  }}
>
  <App />
</ReactApiProvider>
```

Individual hooks can override these defaults:

```tsx
// This hook won't retry (overrides default retry: 3)
const { data } = useHealthCheck(undefined, { retry: false })

// Override queryKey while keeping other defaults
const { data } = useHealthCheck(undefined, { 
  queryKey: ['health', 'custom'],
  refetchInterval: 10000 
})
```

All standard TanStack Query options are supported, including `queryKey`, `retry`, `staleTime`, `refetchInterval`, `enabled`, `onSuccess`, `onError`, and more.

## Error Handling

Hooks throw errors that you can handle:

```tsx
import { useHealthCheck } from '@repo/react'
import { ApiError } from '@repo/core'

function HealthStatus() {
  const { data, error } = useHealthCheck()
  
  if (error) {
    if (error instanceof ApiError) {
      return <div>API Error {error.status}: {error.message}</div>
    }
    return <div>Error: {error.message}</div>
  }
  
  return <div>Status: {data?.datetime}</div>
}
```

## Architecture

### Type Safety

All types are imported directly from `@repo/core`, ensuring:
- **Single source of truth**: Types are generated once in `@repo/core` from the OpenAPI spec
- **No duplication**: This package doesn't generate its own types
- **Type consistency**: Hooks use the same types as the core client

### Dependency Strategy

This package follows the **Framework Wrapper Library** pattern:

- **Peer Dependencies**: Framework dependencies (`react`, `@tanstack/react-query`) - consumers control versions
- **Bundled Dependencies**: Internal workspace dependencies (`@repo/core`)
- **Rationale**: Consumers control framework versions, library adapts to their React Query setup

### Query Key Defaults

Hooks provide sensible default query keys (e.g., `['healthCheck', params]`) but allow full override for flexibility:

- Default keys ensure consistent caching behavior
- Override capability enables advanced use cases (shared queries, custom invalidation, etc.)
- Query keys are fully typed and can include params for automatic cache differentiation

See [API Development](https://basilic-docs.vercel.app/docs/architecture/api#client-consumption) for full integration guide.

## Scripts

- `pnpm --filter @repo/react build` - Build package
- `pnpm --filter @repo/react checktypes` - Type-check
- `pnpm --filter @repo/react test` - Run tests
