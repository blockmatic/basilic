---
name: Hey API Codegen
description: |
  Generate TypeScript clients from OpenAPI specs using @hey-api/openapi-ts. Type-safe API clients with Zod schemas.
  
  Use when: generating TypeScript clients from OpenAPI specifications for frontend or API consumers.
---

# Hey API Codegen

Generate type-safe TypeScript clients from OpenAPI 3.0 specifications using `@hey-api/openapi-ts`.

## Installation

```bash
npm install -D @hey-api/openapi-ts
```

## Configuration

```typescript
// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.json', // Path to OpenAPI spec
  output: {
    path: './src/gen', // Output directory
    format: 'prettier', // Format code with Prettier
  },
  types: {
    enums: 'typescript', // Generate TypeScript enums
  },
  schemas: {
    type: 'zod', // Generate Zod schemas for validation
  },
})
```

## Generate Clients

```bash
npx openapi-ts
# or
pnpm openapi-ts
```

## Generated Output

```
src/gen/
├── client.ts          # Main client
├── types.ts           # TypeScript types
├── schemas.ts         # Zod schemas
└── services/          # Service functions
    ├── users.ts
    └── health.ts
```

## Client Usage

```typescript
import { createClient } from './gen/client'

const client = createClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fully typed API call
const user = await client.GET('/users/{id}', {
  params: {
    path: { id: '123' },
  },
})
// user.data is typed from OpenAPI spec
```

## Authentication

```typescript
const client = createClient({
  baseUrl: process.env.API_URL!,
  getAuthToken: async () => {
    const session = await getSession()
    return session?.token
  },
})
```

## Error Handling

```typescript
try {
  const response = await client.GET('/users/{id}', {
    params: { path: { id: '123' } },
  })
  
  if (response.error) {
    // Handle error (typed from OpenAPI error schemas)
    console.error(response.error)
    return
  }
  
  // response.data is typed
  console.log(response.data)
} catch (error) {
  // Network or other errors
  console.error(error)
}
```

## React Query Integration

```typescript
import { useQuery } from '@tanstack/react-query'
import { client } from './gen/client'

function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await client.GET('/users/{id}', {
        params: { path: { id } },
      })
      if (response.error) throw response.error
      return response.data
    },
  })
}
```

## Schema Validation

Zod schemas are generated for runtime validation:

```typescript
import { UserSchema } from './gen/schemas'

// Validate response data
const result = UserSchema.safeParse(data)
if (!result.success) {
  // Handle validation error
}
```

## References

- React Query integration: Use generated clients with TanStack Query by wrapping API calls in `useQuery` hooks (see React Query Integration section above)
