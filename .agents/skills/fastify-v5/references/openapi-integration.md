# OpenAPI Integration with TypeBox

TypeBox schemas generate OpenAPI 3.0 specs automatically. Use `@fastify/swagger` or custom generation.

## Fastify Swagger

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

// Access spec at /documentation/json
```

## Custom OpenAPI Generation

Generate OpenAPI spec from Fastify routes:

```typescript
// scripts/generate-openapi.ts
import { getOpenAPISpec } from '@fastify/swagger'

const spec = await getOpenAPISpec(fastify)
await writeFile('openapi.json', JSON.stringify(spec, null, 2))
```

## TypeBox → OpenAPI Mapping

TypeBox types map directly to OpenAPI:

- `Type.String()` → `{ type: 'string' }`
- `Type.Number()` → `{ type: 'number' }`
- `Type.Object()` → `{ type: 'object', properties: {...} }`
- `Type.Array()` → `{ type: 'array', items: {...} }`
- `Type.Literal()` → `{ enum: [...] }`
- `format: 'email'` → `{ format: 'email' }`

## Schema Metadata

Add OpenAPI metadata to schemas:

```typescript
const UserSchema = Type.Object({
  id: Type.String({ description: 'User ID' }),
  email: Type.String({ 
    format: 'email',
    description: 'User email address',
  }),
}, {
  description: 'User object',
  examples: [{
    id: '123',
    email: 'user@example.com',
  }],
})
```
