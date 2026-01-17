---
name: TypeBox + Fastify
description: |
  TypeBox schemas with Fastify routes for type-safe API development. Native JSON Schema, automatic OpenAPI generation.
  
  Use when: building Fastify REST APIs with schema validation and OpenAPI generation.
---

# TypeBox + Fastify

Type-safe Fastify routes using TypeBox schemas (native JSON Schema) with automatic OpenAPI generation.

## Setup

```typescript
import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>()
```

## Route Schema Pattern

```typescript
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'

const UserParamsSchema = Type.Object({
  id: Type.String(),
})

const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
})

const ErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
})

const userRoutes: FastifyPluginAsync = async fastify => {
  fastify.get('/users/:id', {
    schema: {
      operationId: 'getUser',
      description: 'Get user by ID',
      tags: ['users'],
      params: UserParamsSchema,
      response: {
        200: UserSchema,
        404: ErrorSchema,
      },
    },
  }, async (request, reply) => {
    // request.params is automatically typed from schema
    const { id } = request.params
    
    const user = await getUserById(id)
    
    if (!user) {
      return reply.code(404).send({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }
    
    return reply.send(user)
  })
}

export default userRoutes
```

## Schema Types

```typescript
// Primitives
Type.String()
Type.Number()
Type.Boolean()
Type.Null()

// Objects
Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  age: Type.Number({ minimum: 0, maximum: 150 }),
})

// Arrays
Type.Array(Type.String())
Type.Array(UserSchema)

// Literals
Type.Literal('active')
Type.Literal(true)

// Optional
Type.Optional(Type.String())

// Union
Type.Union([Type.String(), Type.Number()])
```

## Request Validation

```typescript
// Query parameters
fastify.get('/search', {
  schema: {
    querystring: Type.Object({
      q: Type.String(),
      limit: Type.Optional(Type.Number({ default: 10 })),
    }),
  },
}, async (request, reply) => {
  // request.query is typed
  const { q, limit } = request.query
})

// Request body
fastify.post('/users', {
  schema: {
    body: Type.Object({
      email: Type.String({ format: 'email' }),
      name: Type.String({ minLength: 1 }),
    }),
    response: {
      201: UserSchema,
    },
  },
}, async (request, reply) => {
  // request.body is typed
  const { email, name } = request.body
})
```

## Response Schemas

```typescript
fastify.get('/users', {
  schema: {
    response: {
      200: Type.Array(UserSchema),
      500: ErrorSchema,
    },
  },
}, async (request, reply) => {
  try {
    const users = await getUsers()
    return reply.send(users) // Validated against UserSchema[]
  } catch (error) {
    return reply.code(500).send({
      code: 'SERVER_ERROR',
      message: 'Failed to fetch users',
    })
  }
})
```

## OpenAPI Generation

TypeBox schemas automatically generate OpenAPI specs. Use `@fastify/swagger` or custom generation scripts:

```typescript
import fastifySwagger from '@fastify/swagger'

await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API',
      version: '1.0.0',
    },
  },
})
```

## Type Safety

With `TypeBoxTypeProvider`, request/response types are inferred:

```typescript
// request.params, request.query, request.body are typed
// reply.send() validates against response schema
// Type errors caught at compile time
```

## References

- [OpenAPI Integration](references/openapi-integration.md) - Generating OpenAPI specs from TypeBox schemas
