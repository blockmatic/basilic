# Plugins Folder

Plugins define behavior that is common to all the routes in your
application. Authentication, caching, templates, and all the other cross
cutting concerns should be handled by plugins placed in this folder.

Files in this folder are typically defined through the
[`fastify-plugin`](https://github.com/fastify/fastify-plugin) module,
making them non-encapsulated. They can define decorators and set hooks
that will then be used in the rest of your application.

Check out:

* [The hitchhiker's guide to plugins](https://fastify.dev/docs/latest/Guides/Plugins-Guide/)
* [Fastify decorators](https://fastify.dev/docs/latest/Reference/Decorators/).
* [Fastify lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/).

## Auth Plugin

The `auth.ts` plugin integrates Better Auth with Fastify:

- **Session Middleware**: Attaches session to `request.session` on every request
- **Auth Routes**: Mounts Better Auth routes at `/api/auth/*`
- **Request Extension**: Extends `FastifyRequest` with `session` property

### Usage

```typescript
// In a route handler
fastify.get('/protected', async (request, reply) => {
  // Session is automatically attached by the auth plugin
  if (!request.session) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  
  const userId = request.session.user.id
  // ... use userId
})
```

### Helper Functions

Use helper functions from `src/lib/auth-helpers.ts`:

- `requireAuth(request)` - Throws if no session, returns session otherwise
- `getOptionalAuth(request)` - Returns session or null
- `getUserId(request)` - Extracts user ID from session

```typescript
import { requireAuth } from '../lib/auth-helpers.js'

fastify.get('/wallets', async (request) => {
  const { user } = requireAuth(request)
  // user.id is guaranteed to exist
})
```

### Better Auth Instance

The Better Auth instance is available via `fastify.auth` after the plugin is registered. However, it's recommended to use the helper functions and session middleware instead of accessing the auth instance directly.
