# @basilic/core

Runtime-agnostic ts-rest client for API consumption.

## Overview

Provides `createClient` for making type-safe API calls. Works in Node.js, Next.js, and edge runtimes.

## Usage

```ts
import { createClient } from '@basilic/core'

const client = createClient({
  baseUrl: 'https://api.example.com',
  getAuthToken: async () => token,
  getHeaders: async () => ({ 'X-Custom': 'value' }),
})

const result = await client.users.getUser({ params: { id: '123' } })
```

## Architecture

- ✅ Runtime-agnostic (Node, Next.js, Workers)
- ✅ No React dependencies
- ✅ Type-safe via ts-rest contracts

See [Architecture Documentation](https://basilic-docs.vercel.app/docs/architecture) for integration patterns.
