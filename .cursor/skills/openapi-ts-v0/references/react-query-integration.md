# React Query Integration

Use generated Hey API clients with TanStack Query for caching and state management.

## Basic Hook

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

## Mutation Hook

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from './gen/client'

function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await client.POST('/users', {
        body: data,
      })
      if (response.error) throw response.error
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

## Component Usage

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId)
  const createUser = useCreateUser()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

## Query Key Factory

Use `@lukemorales/query-key-factory` for consistent query keys:

```typescript
import { createQueryKeys } from '@lukemorales/query-key-factory'

export const usersKeys = createQueryKeys('users', {
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: async () => {
      const response = await client.GET('/users/{id}', {
        params: { path: { id } },
      })
      if (response.error) throw response.error
      return response.data
    },
  }),
})

// Usage
const { data } = useQuery(usersKeys.detail(userId))
```
