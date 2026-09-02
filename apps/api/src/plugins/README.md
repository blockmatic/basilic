# Plugins

Plugins define cross-cutting behavior registered before routes: security headers, CORS, JWT, auth, rate limits, and database access.

Files use [`fastify-plugin`](https://github.com/fastify/fastify-plugin) so decorators and hooks apply application-wide.

## Auth plugin (`auth.ts`)

Validates **JWT Bearer** access tokens and **API keys** (`bask_` prefix via `Authorization: Bearer bask_…` or `X-API-Key`).

- Attaches `request.session` on every request when credentials are valid
- `request.session.authKind` is `'jwt'` or `'api-key'`
- JWT path: verifies `typ=access`, loads session + user from the database
- API key path: hashes and compares against `api_keys`, no logout (revoke the key)

```typescript
fastify.get('/protected', async (request, reply) => {
  if (!request.session) return reply.code(401).send({ code: 'UNAUTHORIZED' })
  const userId = request.session.user.id
  // ...
})
```

## Related

- [Authentication](/docs/architecture/authentication)
- [Security baseline](/docs/architecture/security)
