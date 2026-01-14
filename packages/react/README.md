# @basilic/react

React Query integration for ts-rest contracts.

## Overview

Provides `createReactApi` to generate React Query hooks from ts-rest contracts.

## Usage

```ts
import { createReactApi } from '@basilic/react'

const api = createReactApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getAuthToken: async () => session?.token,
})

// Use React Query hooks
const { data } = api.tsr.users.getUser.useQuery({
  queryKey: ['users', id],
  queryData: { params: { id } },
})
```

## Architecture

- ✅ React Query hooks via `@ts-rest/react-query`
- ✅ Built on `@basilic/core` client
- ✅ Type-safe from contracts

See [Architecture Documentation](https://basilic-docs.vercel.app/docs/architecture) for full integration guide.
