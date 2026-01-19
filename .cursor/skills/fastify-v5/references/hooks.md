# Hooks (Request Lifecycle)

Hooks allow you to intercept requests at different stages of the request lifecycle. Use hooks for cross-cutting concerns like logging, security headers, authentication, and error handling.

## Hook Types

Fastify provides several hook types that execute at different points in the request lifecycle:

- `onRequest` - Executes before request is parsed
- `preParsing` - Executes after request is received but before parsing
- `preValidation` - Executes after parsing but before validation
- `preHandler` - Executes after validation but before route handler
- `preSerialization` - Executes before response serialization
- `onSend` - Executes before response is sent
- `onResponse` - Executes after response is sent
- `onError` - Executes when an error occurs

## Basic Hook Pattern

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  // Hook logic
})
```

## onRequest Hook

Execute logic before request parsing. Common uses: security headers, request logging, IP validation.

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  // Add security headers
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('X-Frame-Options', 'DENY')
  
  // Log request
  request.log.info({ method: request.method, url: request.url }, 'Request received')
})
```

## onResponse Hook

Execute logic after response is sent. Common uses: response logging, metrics collection.

```typescript
fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
  }, 'Response sent')
})
```

## onError Hook

Handle errors globally. Common uses: error logging, error transformation, security event logging.

```typescript
fastify.addHook('onError', async (request, reply, error) => {
  // Log error
  request.log.error({ error }, 'Request error')
  
  // Log security events
  if (error.statusCode === 429) {
    request.log.warn({ ip: request.ip }, 'Rate limit exceeded')
  }
})
```

## Hook in Plugin

Create plugins that use hooks:

```typescript
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'

const securityPlugin: FastifyPluginAsync = async fastify => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
  })
  
  fastify.addHook('onError', async (request, reply, error) => {
    if (error.statusCode === 401 || error.statusCode === 403) {
      request.log.warn({ statusCode: error.statusCode }, 'Authentication failure')
    }
  })
}

export default fp(securityPlugin, { name: 'security-headers' })
```

## Multiple Hooks

Register multiple hooks of the same type - they execute in registration order:

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  // First hook
})

fastify.addHook('onRequest', async (request, reply) => {
  // Second hook (executes after first)
})
```

## Hook Scope

Hooks can be registered:
- Globally on Fastify instance (affects all routes)
- On specific routes (affects only that route)
- In plugins (affects routes registered after plugin)

```typescript
// Global hook
fastify.addHook('onRequest', async (request, reply) => {
  // Affects all routes
})

// Route-specific hook
fastify.get('/users', {
  onRequest: async (request, reply) => {
    // Only affects this route
  },
}, async (request, reply) => {
  return reply.send({ users: [] })
})
```

## Hook with Async Operations

Hooks can perform async operations:

```typescript
fastify.addHook('preHandler', async (request, reply) => {
  // Async authentication check
  const user = await authenticate(request.headers.authorization)
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  
  // Attach user to request
  request.user = user
})
```

## Error Handling in Hooks

Return errors from hooks to stop request processing:

```typescript
fastify.addHook('preHandler', async (request, reply) => {
  if (!request.headers.authorization) {
    return reply.code(401).send({ error: 'Missing authorization' })
  }
})
```

## Best Practices

- Use `onRequest` for security headers and request logging
- Use `onResponse` for response logging and metrics
- Use `onError` for error logging and security event tracking
- Keep hooks focused and single-purpose
- Use plugins to organize hooks logically
- Avoid heavy computation in hooks (use async operations when needed)
- Return errors from hooks to stop request processing

## See Also

- [Hook Plugin Template](@cursor/skills/fastify-v5/templates/hook-plugin.ts) - Complete hook plugin example
- [Plugin Patterns](@cursor/skills/fastify-v5/references/plugins.md) - Plugin development guide
- [Fastify Lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/)
