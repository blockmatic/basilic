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

The `auth.ts` plugin provides JWT-based session validation:

- **Session Middleware**: Attaches session to `request.session` on every request via Bearer token validation
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

The plugin validates Bearer tokens, verifies JWTs, and loads session data from the database. Routes should check `request.session` directly to determine authentication status.
