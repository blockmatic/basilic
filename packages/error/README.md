# @repo/error

Error handling utilities with Sentry integration and centralized error catalog. Provides consistent, type-safe error handling across all monorepo applications.

## Features

- ✅ **Centralized Catalog**: All error codes defined in the package, pre-registered at build time
- ✅ **Sentry Integration**: Async error capture with built-in PII scrubbing
- ✅ **Type-Safe**: TypeScript-first with proper type guards and union types for error codes
- ✅ **Framework-Native**: Fastify handlers, React Error Boundaries, Next.js error pages
- ✅ **Security-First**: Sentry built-in PII scrubbing, no internal leaks
- ✅ **Performance**: Async Sentry capture, non-blocking, zero latency impact

## Export Structure

The package provides platform-specific exports (no root exports):

- `@repo/error/core` - Core functionality (types, catalog, utils) - NO Sentry dependencies
- `@repo/error/node` - Node.js/Fastify (uses `@sentry/node`)
- `@repo/error/nextjs` - Next.js (uses `@sentry/nextjs`) - works for both client and server
- `@repo/error/browser` - Browser frameworks (uses `@sentry/browser`) - TanStack Start, Vue, Svelte, etc.
- `@repo/error/react` - React components

**Import Rules:**
- All imports must use platform-specific paths (no root `@repo/error` import)
- Type imports (`CatalogError`, `CoreErrorCode`) → Use platform-specific path or `/core`
- Runtime imports (`captureError`, `initSentry`) → Use `/node`, `/nextjs`, or `/browser`
- Core utilities (`getError`, `mapHttpStatusToErrorCode`, `getErrorMessage`) → Available from all platform exports

## Quick Start

### Capture Error (Most Common)

```typescript
// Node.js / Fastify applications
import { captureError } from '@repo/error/node'

// Next.js applications (works for both client and server)
import { captureError } from '@repo/error/nextjs'

// Browser frameworks (TanStack Start, Vue, Svelte, etc.)
import { captureError } from '@repo/error/browser'

const catalogError = captureError({
  code: 'NETWORK_ERROR',
  error, // Real error → Sentry (full stack trace)
  label: 'API Call',
  data: { endpoint: '/api/data' }, // Internal context → Sentry
  tags: { app: 'web' },
})
// Returns: { code: 'NETWORK_ERROR', message: 'A network error occurred' }
// User sees safe message, Sentry gets full details
```

**Important**: Import `captureError` from the platform-specific path:
- Use `@repo/error/node` for Node.js/Fastify
- Use `@repo/error/nextjs` for Next.js applications (client and server)
- Use `@repo/error/browser` for browser-only frameworks

### Extract Error Message

```typescript
// Core utilities available from all platform exports
import { getErrorMessage } from '@repo/error/nextjs' // or '/node', '/browser', '/core'
const message = getErrorMessage(error) // Type-safe!
```

### Initialize Sentry

```typescript
// For Next.js apps
import { initSentry } from '@repo/error/nextjs'
// For Node.js/Fastify apps
// import { initSentry } from '@repo/error/node'
// For browser frameworks
// import { initSentry } from '@repo/error/browser'

// Initialize BEFORE framework starts
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## Core Concepts

### Two-Track Error Handling

When an error occurs, two separate things happen:

1. **Sentry (Internal)** - REAL error with full-stack trace and internal context for debugging
2. **API Response (External)** - SAFE catalog error with user-friendly message

```typescript
// Real error occurs
const realError = new Error('Connection to postgres://internal-db:5432 failed')

// captureError sends REAL error to Sentry
const catalogError = captureError({
  code: 'SERVER_ERROR',
  error: realError, // ← Full error with stack trace → Sentry
  label: 'Database Connection',
  data: { host: 'internal-db' }, // Internal details for debugging
})

// API returns SAFE catalog error to user
reply.status(500).send(catalogError)
// Response: { code: 'SERVER_ERROR', message: 'An internal server error occurred' }
// ❌ User NEVER sees: stack traces, connection strings, internal IPs
```

### Centralized Error Catalog

All error codes are defined in `packages/error/src/catalogs/` and merged at build time:

- `server.ts` - Server-side HTTP errors
- `client.ts` - Client-side validation and network errors
- `common.ts` - Common errors used across both
- `api.ts` - API-specific errors
- `web.ts` - Web app-specific errors

**Build-time Validation:**
- Each catalog is validated individually (format, duplicates, code property matching)
- Cross-catalog duplicate detection ensures no code collisions
- Build fails if validation errors are found

To add new error codes, add them to the appropriate catalog file and rebuild the package.

## API Reference

### `captureError(options)`

Captures an error to Sentry and returns a safe catalog error for API responses.

```typescript
interface CaptureErrorOptions {
  code: CoreErrorCode | string // Error code (must exist in catalog)
  error: unknown // Real error: sent to Sentry
  label: string // Component/feature label
  logger?: Logger // Optional logger instance (defaults to internal logger). Use Fastify's request.log for native logging.
  data?: Record<string, unknown> // Additional context (Sentry only)
  tags?: {
    app: string // Required: 'api' | 'web' | 'mobile' | 'docs' | string
    package?: string // Optional: '@repo/auth'
    module?: string // Optional: 'user-service'
  }
  level?: 'error' | 'warning' | 'info'
}

function captureError(options: CaptureErrorOptions): CatalogError
```

### `getError(code)`

Retrieves an error from the catalog by code.

```typescript
function getError(code: string): CatalogError | undefined
```

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
- **Node.js** (`@repo/error/node`): Only includes `'Non-Error promise rejection'` in `ignoreErrors`. Network-related errors (e.g., `ECONNREFUSED`, `ETIMEDOUT`) should be filtered via `beforeSend` hook if needed.
- **Next.js/Browser** (`@repo/error/nextjs`, `@repo/error/browser`): Includes browser-specific patterns: `'ResizeObserver loop'`, `'Non-Error promise rejection'`, `'NetworkError'`, `'Failed to fetch'`.

### `mapHttpStatusToErrorCode(statusCode)`

Maps HTTP status codes to error catalog codes. Returns a type-safe `CoreErrorCode` union type.

```typescript
function mapHttpStatusToErrorCode(statusCode?: number): CoreErrorCode
```

**Type Safety:** The return type is `CoreErrorCode`, ensuring compile-time guarantee that mapped codes are valid error codes.

**Validation:**
- Missing values (`null`/`undefined`) → `SERVER_ERROR`
- Invalid numeric values (`0`, `NaN`, non-number) → `UNEXPECTED_ERROR`
- Out-of-range valid numbers (< 100 or > 599) → `UNEXPECTED_ERROR`
- Valid status codes → proper mapping to catalog codes

### `getErrorMessage(error)`

Extracts error message from unknown error type (type-safe).

```typescript
function getErrorMessage(error: unknown): string
```

## Framework Integration

### Fastify

```typescript
// apps/fastify/src/plugins/error-handler.ts
import { captureError, mapHttpStatusToErrorCode } from '@repo/error/node'

fastify.setErrorHandler((error, request, reply) => {
  // mapHttpStatusToErrorCode handles null/undefined/invalid statusCode gracefully
  const catalogError = captureError({
    code: mapHttpStatusToErrorCode(error.statusCode),
    error,
    logger: request.log, // Use Fastify's native logger for request context
    label: `${request.method} ${request.url}`,
    tags: { app: 'api', module: 'user-service' },
  })
  reply.status(error.statusCode ?? 500).send(catalogError)
})
```

**Note**: Pass `logger: request.log` to use Fastify's native Pino logger with automatic request context (requestId via `requestIdLogLabel: 'reqId'`). If omitted, `captureError` defaults to the internal logger from `@repo/utils/logger`.

### React Error Boundary

```typescript
import { AppErrorBoundary } from '@repo/error/react'
import { captureError } from '@repo/error/nextjs' // or /node, /browser

<AppErrorBoundary app="web" captureError={captureError}>
  <App />
</AppErrorBoundary>
```

**Note**: `AppErrorBoundary` requires `captureError` as a prop. Import the appropriate implementation for your platform.

### Next.js

```typescript
// apps/next/instrumentation.ts
import { initSentry } from '@repo/error/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initSentry({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
    })
  }
}
```

## Error Code Format

Error codes must be `UPPER_SNAKE_CASE`:

- ✅ `NETWORK_ERROR`
- ✅ `USER_NOT_FOUND`
- ✅ `AI_MODEL_ERROR`
- ❌ `network-error` (invalid)
- ❌ `NetworkError` (invalid)
- ❌ `NETWORK_ERROR_` (invalid)

## Error Catalogs

The package includes the following error catalogs, all merged at build time:

**Server Errors**: `SERVER_ERROR`, `BAD_REQUEST`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_INPUT`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `BAD_GATEWAY`, `SERVICE_UNAVAILABLE`, `GATEWAY_TIMEOUT`

**Client Errors**: `CLIENT_VALIDATION_ERROR`, `CLIENT_FORMAT_ERROR`, `NETWORK_ERROR`, `NETWORK_TIMEOUT`, `FETCH_ERROR`

**Common**: `UNEXPECTED_ERROR`

**API-Specific**: `AI_MODEL_ERROR`, `AI_RATE_LIMIT_EXCEEDED`, `BLOCKCHAIN_TRX_OP_FAILURE`, `BLOCKCHAIN_BLOCK_PROCESSING_ERROR`

**Web-Specific**: `DASHBOARD_DATA_LOAD_FAILED`

## Security

- Sentry's built-in PII scrubbing handles sensitive data automatically
- Optional `beforeSend` hook for domain-specific scrubbing
- Never expose internal details to users
- All errors logged via provided logger (or defaults to `@repo/utils/logger`). In Fastify, use `logger: request.log` for native logging with request context.

## Performance

- Async Sentry capture via `Promise.resolve().then()` (non-blocking)
- Error extraction: < 1ms
- Zero latency impact on API responses

**Serverless Limitation**: In serverless environments (AWS Lambda, Vercel Functions), errors may be dropped if the function terminates before the promise executes. For critical paths, call `Sentry.flush()` explicitly:

```typescript
import * as Sentry from '@sentry/node' // or @sentry/nextjs, @sentry/browser

// In critical serverless handler
const catalogError = captureError({ /* ... */ })
await Sentry.flush(2000) // Wait up to 2s for Sentry to send
return reply.send(catalogError)
```

## Type Safety

The package provides compile-time type safety for error codes:

### CoreErrorCode Type

`CoreErrorCode` is a union type of all error codes from the merged catalogs:

```typescript
import type { CoreErrorCode } from '@repo/error/core' // or platform-specific path

// All codes get autocomplete and type checking
const code: CoreErrorCode = 'NETWORK_ERROR' // ✅ Type-safe
const code2: CoreErrorCode = 'AI_MODEL_ERROR' // ✅ Type-safe
const code3: CoreErrorCode = 'INVALID_CODE' // ❌ Type error

// mapHttpStatusToErrorCode returns CoreErrorCode
const errorCode = mapHttpStatusToErrorCode(404) // Type: CoreErrorCode
```

### CaptureErrorOptions Type Safety

```typescript
import { captureError } from '@repo/error/nextjs'
import type { CoreErrorCode } from '@repo/error/core'

// All catalog codes get autocomplete
captureError({
  code: 'NETWORK_ERROR', // ✅ Autocomplete available
  error: new Error('test'),
  label: 'Test',
  tags: { app: 'web' }, // ✅ Autocomplete for 'api' | 'web' | 'mobile' | 'docs'
})
```

### Type Testing

Run type tests to verify type safety:

```bash
pnpm test:types
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

Error utilities have been moved from `@repo/utils/error` to `@repo/error`:

```typescript
// Old
import { getErrorMessage } from '@repo/utils/error'

// New (for Next.js apps)
import { getErrorMessage, captureError } from '@repo/error/nextjs'
// For Node.js/Fastify apps
// import { getErrorMessage, captureError } from '@repo/error/node'
// For browser frameworks
// import { getErrorMessage, captureError } from '@repo/error/browser'
```

## See Also

- [Error Handling Guide](@apps/docu/content/docs/architecture/error-handling.mdx) - Complete guide with examples and best practices
- [Logging Guide](@apps/docu/content/docs/architecture/logging.mdx) - Logging patterns with @repo/utils/logger
- [Security Guide](@apps/docu/content/docs/security/index.mdx) - Security best practices and PII handling

## License

PROPRIETARY
