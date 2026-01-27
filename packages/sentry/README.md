# @repo/sentry

Sentry integration package for error reporting and optional logging. Provides consistent error reporting across all monorepo applications.

## Features

- ✅ **Sentry Integration**: Async error capture with built-in PII scrubbing
- ✅ **Framework-Native**: Fastify handlers, React Error Boundaries, Next.js error pages
- ✅ **Security-First**: Sentry built-in PII scrubbing, no internal leaks
- ✅ **Performance**: Async Sentry capture, non-blocking, zero latency impact
- ✅ **Optional Logging**: Integrates with `@repo/utils/logger` or custom loggers

## Export Structure

The package provides platform-specific exports (no root exports):

- `@repo/sentry/core` - Core functionality (types, utils) - NO Sentry dependencies
- `@repo/sentry/node` - Node.js/Fastify (uses `@sentry/node`)
- `@repo/sentry/nextjs` - Next.js (uses `@sentry/nextjs`) - works for both client and server
- `@repo/sentry/browser` - Browser frameworks (uses `@sentry/browser`) - TanStack Start, Vue, Svelte, etc.
- `@repo/sentry/react` - React components

**Import Rules:**
- All imports must use platform-specific paths (no root `@repo/sentry` import)
- Type imports (`CaptureErrorOptions`, `ErrorWithMessage`) → Use platform-specific path or `/core`
- Runtime imports (`captureError`, `initSentry`) → Use `/node`, `/nextjs`, or `/browser`
- Core utilities (`getErrorMessage`) → Available from all platform exports

## Quick Start

### Capture Error (Most Common)

```typescript
// Node.js / Fastify applications
import { captureError } from '@repo/sentry/node'

// Next.js applications (works for both client and server)
import { captureError } from '@repo/sentry/nextjs'

// Browser frameworks (TanStack Start, Vue, Svelte, etc.)
import { captureError } from '@repo/sentry/browser'

// Report error to Sentry (non-blocking)
captureError({
  code: 'NETWORK_ERROR', // Optional: error code for tagging in Sentry
  error, // Real error → Sentry (full stack trace)
  label: 'API Call',
  data: { endpoint: '/api/data' }, // Internal context → Sentry
  tags: { app: 'web' },
})
```

**Important**: Import `captureError` from the platform-specific path:
- Use `@repo/sentry/node` for Node.js/Fastify
- Use `@repo/sentry/nextjs` for Next.js applications (client and server)
- Use `@repo/sentry/browser` for browser-only frameworks

### Extract Error Message

```typescript
// Core utilities available from all platform exports
import { getErrorMessage } from '@repo/sentry/nextjs' // or '/node', '/browser', '/core'
const message = getErrorMessage(error) // Type-safe!
```

### Initialize Sentry

```typescript
// For Next.js apps
import { initSentry } from '@repo/sentry/nextjs'
// For Node.js/Fastify apps
// import { initSentry } from '@repo/sentry/node'
// For browser frameworks
// import { initSentry } from '@repo/sentry/browser'

// Initialize BEFORE framework starts
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## Core Concepts

### Error Reporting Only

`captureError` is purely for reporting errors to Sentry. It does not return error objects or handle error catalogs. Each app manages its own error handling and catalogs.

```typescript
// Real error occurs
const realError = new Error('Connection to postgres://internal-db:5432 failed')

// captureError sends REAL error to Sentry (non-blocking)
captureError({
  code: 'SERVER_ERROR', // Optional: for tagging in Sentry
  error: realError, // ← Full error with stack trace → Sentry
  label: 'Database Connection',
  data: { host: 'internal-db' }, // Internal details for debugging
  // logger is optional - only used for warnings when Sentry not initialized
})

// App handles its own error response using its own catalog
const catalogError = getError('SERVER_ERROR') // From app's own catalog
reply.status(500).send(catalogError)
```

## API Reference

### `captureError(options)`

Captures an error to Sentry asynchronously (non-blocking). Returns `void`.

```typescript
interface CaptureErrorOptions {
  error: unknown // Real error: sent to Sentry
  label: string // Component/feature label
  code?: string // Optional error code (used as tag only, for filtering in Sentry)
  logger?: Logger // Optional logger instance (only used for warnings when Sentry not initialized)
  data?: Record<string, unknown> // Additional context (Sentry only)
  tags?: Record<string, string> // Tags for filtering in Sentry
  level?: 'error' | 'warning' | 'info' // Error level for Sentry
  report?: boolean // Whether to report to Sentry (default: true)
}

function captureError(options: CaptureErrorOptions): void
```

#### Why `CaptureErrorOptions` Instead of Sentry's Native Types?

`CaptureErrorOptions` provides a developer-friendly abstraction over Sentry's native `captureException` API with several value-adds:

1. **`error: unknown`** - Sentry's `captureException` expects `Error`, but we accept `unknown` and automatically convert non-Error values (strings, objects, etc.) to Error instances. This handles all possible thrown values safely.

2. **`label: string`** - Convenience field that automatically maps to both `tags.component` and `contexts.error.label` in Sentry. Enforces consistent labeling patterns across the codebase.

3. **`code?: string`** - Convenience field that automatically maps to both `tags.errorCode` and `contexts.error.code` in Sentry. Common pattern for error categorization and filtering.

4. **`logger?: Logger`** - Optional logging integration. Only used for warnings when Sentry is not initialized (e.g., missing DSN). If omitted, defaults to `@repo/utils/logger`. In Fastify, pass `request.log` for request context.

5. **`report?: boolean`** - Allows disabling Sentry reporting entirely without conditional logic. Sentry doesn't provide this natively.

6. **Simplified API** - Combines Sentry's `tags`, `level`, and `contexts` into a single, intuitive interface. The `data` field automatically merges into `contexts.error` for convenience.

**Logging is Optional**: The `logger` parameter is only used to log a warning when Sentry is not initialized. Errors are not logged by default - they're only sent to Sentry. If you need error logging, handle it separately in your application code.

### `initSentry(options)`

Initializes Sentry for error tracking. Supports `@sentry/node`, `@sentry/nextjs`, and `@sentry/browser`.

```typescript
interface InitSentryOptions {
  dsn?: string
  environment?: string
  release?: string
  beforeSend?: (event: ErrorEvent, hint: EventHint) => ErrorEvent | null
}

function initSentry(options: InitSentryOptions): void
```

**Idempotency:** `initSentry` automatically checks if Sentry is already initialized using `Sentry.getClient()` before initializing. You can safely call it multiple times (e.g., in both server-side instrumentation and client-side error boundaries) without causing double initialization.

**Platform-Specific Configuration:**
- **Node.js** (`@repo/sentry/node`): Only includes `'Non-Error promise rejection'` in `ignoreErrors`. Network-related errors (e.g., `ECONNREFUSED`, `ETIMEDOUT`) should be filtered via `beforeSend` hook if needed.
- **Next.js/Browser** (`@repo/sentry/nextjs`, `@repo/sentry/browser`): Includes browser-specific patterns: `'ResizeObserver loop'`, `'Non-Error promise rejection'`, `'NetworkError'`, `'Failed to fetch'`.

### `getErrorMessage(error)`

Extracts error message from unknown error type (type-safe).

```typescript
function getErrorMessage(error: unknown): string
```

## Framework Integration

### Fastify

```typescript
// apps/fastify/src/plugins/error-handler.ts
import { captureError } from '@repo/sentry/node'
import { getError } from '../lib/catalogs/index.js' // App's own catalog
import { mapHttpStatusToErrorCode } from '../lib/mappers.js' // App's own mapper

fastify.setErrorHandler((error, request, reply) => {
  // Report to Sentry
  captureError({
    code: mapHttpStatusToErrorCode(error.statusCode), // Optional: for tagging
    error,
    logger: request.log, // Use Fastify's native logger for request context
    label: `${request.method} ${request.url}`,
    tags: { app: 'api', module: 'user-service' },
  })

  // Handle error response using app's own catalog
  const errorCode = mapHttpStatusToErrorCode(error.statusCode)
  const catalogError = getError(errorCode) ?? getError('UNEXPECTED_ERROR')
  reply.status(error.statusCode ?? 500).send(catalogError)
})
```

**Note**: Pass `logger: request.log` to use Fastify's native Pino logger with automatic request context (requestId via `requestIdLogLabel: 'reqId'`). If omitted, `captureError` defaults to the internal logger from `@repo/utils/logger`.

### React Error Boundary

```typescript
import { AppErrorBoundary } from '@repo/sentry/react'
import { captureError } from '@repo/sentry/nextjs' // or /node, /browser

<AppErrorBoundary app="web" captureError={captureError}>
  <App />
</AppErrorBoundary>
```

**Note**: `AppErrorBoundary` requires `captureError` as a prop. Import the appropriate implementation for your platform.

### Next.js

```typescript
// apps/next/instrumentation.ts
import { initSentry } from '@repo/sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initSentry({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
    })
  }
}
```

## Security

- Sentry's built-in PII scrubbing handles sensitive data automatically
- Optional `beforeSend` hook for domain-specific scrubbing
- Never expose internal details to users
- Optional logging: The `logger` parameter is only used for warnings when Sentry is not initialized. Errors are not logged by default - they're only sent to Sentry. If you need error logging, handle it separately in your application code.

## Performance

- Async Sentry capture via `Promise.resolve().then()` (non-blocking)
- Zero latency impact on API responses

**Serverless Limitation**: In serverless environments (AWS Lambda, Vercel Functions), errors may be dropped if the function terminates before the promise executes. For critical paths, call `Sentry.flush()` explicitly:

```typescript
import * as Sentry from '@sentry/node' // or @sentry/nextjs, @sentry/browser

// In critical serverless handler
captureError({ /* ... */ })
await Sentry.flush(2000) // Wait up to 2s for Sentry to send
return reply.send(catalogError)
```

## Testing

Mock Sentry and logger in tests:

```typescript
vi.mock('@sentry/node', () => ({
  getClient: vi.fn(() => ({})),
  captureException: vi.fn(),
}))

vi.mock('@repo/utils/logger', () => ({
  logger: {
    child: vi.fn(() => ({ error: vi.fn() })),
  },
}))
```

## Migration from @repo/utils/error

Error utilities have been moved from `@repo/utils/error` to `@repo/sentry`:

```typescript
// Old
import { getErrorMessage } from '@repo/utils/error'

// New (for Next.js apps)
import { getErrorMessage, captureError } from '@repo/sentry/nextjs'
// For Node.js/Fastify apps
// import { getErrorMessage, captureError } from '@repo/sentry/node'
// For browser frameworks
// import { getErrorMessage, captureError } from '@repo/sentry/browser'
```

## See Also

- [Error Handling Guide](@apps/docu/content/docs/architecture/error-handling.mdx) - Complete guide with examples and best practices
- [Logging Guide](@apps/docu/content/docs/architecture/logging.mdx) - Logging patterns with @repo/utils/logger
- [Security Guide](@apps/docu/content/docs/security/index.mdx) - Security best practices and PII handling

## License

PROPRIETARY
