# @repo/sentry

Common interface for error reporting across the monorepo. Apps and packages use **`captureError`** for a consistent, type-safe way to send errors to Sentry. Sentry is **registered at the application level** (e.g. Fastify plugin, Next.js instrumentation); individual packages only import and call `captureError`.

## Exports

| Path | Use for |
|------|--------|
| `@repo/sentry/node` | Node.js / Fastify |
| `@repo/sentry/nextjs` | Next.js (client + server) |
| `@repo/sentry/browser` | Browser-only (TanStack Start, Vue, Svelte, etc.) |
| `@repo/sentry/react` | React Error Boundary component |

**Import rule:** Use the platform path that matches your app. The `CaptureErrorOptions` type is re-exported from each platform path. **Initialization** is not part of this package—init Sentry per your platform’s [Sentry docs](https://docs.sentry.io/platforms/) (Node, Browser, Next.js). **Error normalization** (e.g. `toErrorWithMessage`, `getErrorMessage`) lives in `@repo/utils/error`

## Quick start

**Capture an error** (non-blocking, async):

```typescript
import { captureError } from '@repo/sentry/node' // or /nextjs, /browser

captureError({
  error,
  label: 'API Call',
  code: 'NETWORK_ERROR',   // optional, for Sentry tags
  data: { endpoint: '/api/data' },
  tags: { app: 'web' },
})
```

## API

### `captureError(options): void`

Sends the error to Sentry asynchronously. Does not return errors or handle app catalogs; each app owns response handling and error catalogs.

| Option | Type | Description |
|--------|------|-------------|
| `error` | `unknown` | Converted to `Error` if needed; full stack sent to Sentry |
| `label` | `string` | Component/feature label → Sentry `tags.component` and `contexts.error.label` |
| `code?` | `string` | Optional tag → `tags.errorCode`, `contexts.error.code` |
| `data?` | `Record<string, unknown>` | Extra context → `contexts.error` |
| `tags?` | `Record<string, string>` | Extra tags |
| `level?` | `'error' \| 'warning' \| 'info'` | Default `'error'` |
| `report?` | `boolean` | If `false`, skip Sentry (default `true`) |
| `logger?` | `Logger` | Optional; only used to warn when Sentry is not initialized. In Fastify, pass `request.log` for request context. |

## Framework integration

**Fastify** — Init Sentry with `@sentry/node` at app bootstrap (see [Sentry Node](https://docs.sentry.io/platforms/javascript/guides/node/)). Use `captureError` in your error handler:

```typescript
import { captureError } from '@repo/sentry/node'

fastify.setErrorHandler((error, request, reply) => {
  captureError({
    error,
    label: `${request.method} ${request.url}`,
    logger: request.log,
    tags: { app: 'api' },
  })
  // App handles response (catalog, status, etc.)
  const catalogError = getError(mapHttpStatusToErrorCode(error.statusCode)) ?? getError('UNEXPECTED_ERROR')
  reply.status(error.statusCode ?? 500).send(catalogError)
})
```

**React Error Boundary** — Pass platform-specific `captureError`:

```typescript
import { AppErrorBoundary } from '@repo/sentry/react'
import { captureError } from '@repo/sentry/nextjs'

<AppErrorBoundary app="web" captureError={captureError}>
  <App />
</AppErrorBoundary>
```

**Next.js** — Use [Sentry’s standard setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/): `withSentryConfig` in `next.config`, plus `sentry.server.config.ts`, `instrumentation-client.ts`, `sentry.edge.config.ts`, and `instrumentation.ts` with `register()` and `onRequestError`. In your app code, use the common interface:

```typescript
import { captureError } from '@repo/sentry/nextjs'

// Use anywhere (client or server)
captureError({ error, label: 'Checkout', tags: { app: 'web' } })
```

## Security and performance

- Sentry’s built-in PII scrubbing is used; add `beforeSend` for domain-specific filtering.
- Capture is async (`Promise.resolve().then(...)`), non-blocking. In serverless, consider `Sentry.flush()` before returning if the process exits quickly.

## Scripts

- `pnpm --filter @repo/sentry build` - Build package
- `pnpm --filter @repo/sentry checktypes` - Type-check
- `pnpm --filter @repo/sentry test` - Run tests

## See also

- [Error Handling Guide](/docs/architecture/error-handling)
- [Logging Guide](/docs/architecture/logging)
- [Security Guide](/docs/security)
