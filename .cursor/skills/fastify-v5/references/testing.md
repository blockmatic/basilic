# Testing Patterns

Test Fastify routes using `fastify.inject()` for blackbox testing. This method simulates HTTP requests without starting an HTTP server, making tests fast and reliable.

## Basic Test Setup

Create a test app builder utility:

```typescript
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import app from '../../src/app.js'

export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  }).withTypeProvider<TypeBoxTypeProvider>()

  await fastify.register(app)
  await fastify.ready()
  return fastify
}
```

## Basic Test Pattern

```typescript
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildTestApp } from '../utils/fastify.js'

describe('GET /health', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  it('should return 200 status', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
  })
})
```

## Testing Route Responses

Test response body and structure:

```typescript
it('should return response matching schema', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/health',
  })

  const data = JSON.parse(response.body)

  expect(data).toMatchObject({
    ok: true,
    now: expect.any(String),
  })
})
```

## Testing with Query Parameters

```typescript
it('should handle query parameters', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/users?limit=10&offset=0',
  })

  expect(response.statusCode).toBe(200)
})
```

## Testing POST Requests

Test POST requests with body:

```typescript
it('should create user', async () => {
  const response = await fastify.inject({
    method: 'POST',
    url: '/users',
    payload: {
      email: 'user@example.com',
      name: 'Test User',
    },
  })

  expect(response.statusCode).toBe(201)
  const data = JSON.parse(response.body)
  expect(data.email).toBe('user@example.com')
})
```

## Testing with Headers

```typescript
it('should require authorization', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/protected',
    headers: {
      authorization: 'Bearer token123',
    },
  })

  expect(response.statusCode).toBe(200)
})
```

## Testing Error Responses

Test error cases:

```typescript
it('should return 404 for non-existent user', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/users/non-existent-id',
  })

  expect(response.statusCode).toBe(404)
  const data = JSON.parse(response.body)
  expect(data.code).toBe('NOT_FOUND')
})
```

## Testing Route Parameters

```typescript
it('should get user by ID', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/users/123',
  })

  expect(response.statusCode).toBe(200)
  const data = JSON.parse(response.body)
  expect(data.id).toBe('123')
})
```

## Testing Response Validation

Fastify automatically validates responses against schemas. Test that responses match schema:

```typescript
it('should validate response against schema', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/health',
  })

  // Fastify validates automatically using TypeBox schema
  // This test verifies the response structure matches the schema
  const data = JSON.parse(response.body)
  expect(data.ok).toBe(true)
  expect(typeof data.now).toBe('string')
  expect(data.now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
})
```

## Testing Streaming Responses

For streaming responses, test headers and response type:

```typescript
it('should stream response', async () => {
  const response = await fastify.inject({
    method: 'POST',
    url: '/stream',
    payload: { messages: [] },
  })

  expect(response.statusCode).toBe(200)
  expect(response.headers['content-type']).toBe('text/event-stream')
})
```

## Mocking External Dependencies

Mock external services in tests:

```typescript
import { vi } from 'vitest'

// Mock external service
vi.mock('../../src/services/external.js', () => ({
  fetchExternalData: vi.fn().mockResolvedValue({ data: 'mocked' }),
}))

it('should use mocked service', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/data',
  })

  expect(response.statusCode).toBe(200)
})
```

## Test Isolation

Each test should be independent. Use `beforeAll` and `afterAll` for setup/teardown:

```typescript
describe('User Routes', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await buildTestApp()
  })

  afterAll(async () => {
    await fastify.close()
  })

  // Tests are isolated - each test gets a fresh request
  it('test 1', async () => {
    // ...
  })

  it('test 2', async () => {
    // ...
  })
})
```

## Best Practices

- Use `fastify.inject()` for blackbox testing (no HTTP server needed)
- Disable logging in tests (`logger: false`)
- Always close Fastify instance in `afterAll`
- Test both success and error cases
- Verify response status codes and body structure
- Use TypeBox schemas for automatic response validation
- Keep tests focused and independent
- Use descriptive test names

## See Also

- [Test Utils Template](@cursor/skills/fastify-v5/templates/test-utils.ts) - Test app builder example
- [Backend Testing Rules](@.cursor/rules/backend/testing.mdc) - Testing standards for Fastify
