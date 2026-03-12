# Routes Folder

Routes define the pathways within your application.
Fastify's structure supports the modular monolith approach, where your
application is organized into distinct, self-contained modules.
This facilitates easier scaling and future transition to a microservice architecture.
In the future you might want to independently deploy some of those.

In this folder you should define all the routes that define the endpoints
of your web application.
Each service is a [Fastify
plugin](https://fastify.dev/docs/latest/Reference/Plugins/), it is
encapsulated (it can have its own independent plugins) and it is
typically stored in a file; be careful to group your routes logically,
e.g. all `/users` routes in a `users.js` file. We have added
a `root.js` file for you with a '/' root added.

If a single file becomes too large, create a folder and add a `index.js` file there:
this file must be a Fastify plugin, and it will be loaded automatically
by the application. You can now add as many files as you want inside that folder.
In this way you can create complex routes within a single monolith,
and eventually extract them.

If you need to share functionality between routes, place that
functionality into the `plugins` folder, and share it via
[decorators](https://fastify.dev/docs/latest/Reference/Decorators/).

If you're a bit confused about using `async/await` to write routes, you would
better take a look at [Promise resolution](https://fastify.dev/docs/latest/Reference/Routes/#promise-resolution) for more details.

## Schema Definition

**Principle: Collocation** - Keep schemas with their routes, not in separate folders.

### Simple Routes (single/few endpoints)
Define TypeBox schemas directly in the route file:

```typescript
import { Type } from 'typebox'
import type { FastifyPluginAsync } from 'fastify'

const HealthResponseSchema = Type.Object({
  ok: Type.Literal(true),
  now: Type.String({ format: 'date-time' }),
})

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', {
    schema: {
      response: {
        200: HealthResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.send({
      ok: true,
      now: new Date().toISOString(),
    })
  })
}

export default healthRoutes
```

### Complex Routes (multiple endpoints, shared logic)
For complex routes, you can optionally extract schemas to a separate file within the route folder:

```text
routes/
  └── ai/
      ├── index.ts        # Route definitions
      ├── schemas.ts      # Schemas (optional, if they get large)
      └── services.ts     # Business logic (optional)
```

**Key points:**
- ✅ Use TypeBox for all route schemas (native JSON Schema)
- ✅ Keep schemas collocated with routes (same file or same folder)
- ✅ Fastify validates automatically - no manual validation needed
- ✅ Request/response types are automatically inferred with TypeBox type provider
