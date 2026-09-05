# @repo/error

Error reporting and utilities for the monorepo. Use **`captureError`** for consistent, type-safe error reporting. Use **`getErrorMessage`**, **`tryCatch`**, etc. for message extraction and Result handling. Error reporting is **initialized at the application level**; packages only import and call `captureError`.

## Exports

| Path | Use for |
|------|--------|
| `@repo/error` | Error utils: `getErrorMessage`, `tryCatch`, `toErrorWithMessage`, `isErrorWithMessage`, `ErrorWithMessage`, `Result` |
| `@repo/error/node` | Node.js / Fastify: `captureError`, `initErrorReporting` |
| `@repo/error/nextjs` | Next.js (client + server): `captureError`, `initErrorReporting`, `getErrorMessage` |
| `@repo/error/browser` | Browser-only (TanStack Start, Vue, Svelte, etc.) |
| `@repo/error/react` | React Error Boundary component |

**Import rule:** Use the platform path that matches your app. For error utils only, use `@repo/error`. For capture + init, use `@repo/error/node`, `@repo/error/nextjs`, or `@repo/error/browser`.

## Error reporting backend

**GlitchTip** (open source) is recommended. Sentry (open source or cloud) also works—same DSN format and SDK. **`initErrorReporting` is currently a no-op** in this repo: setting `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` does **not** enable reporting until init is implemented. Until then, `captureError` logs via the provided or default logger.

## Quick start

**Capture an error** (non-blocking, async):

```typescript
import { captureError } from '@repo/error/node' // or /nextjs, /browser

captureError({
  error,
  label: 'API Call',
  code: 'NETWORK_ERROR',
  data: { endpoint: '/api/data' },
  tags: { app: 'web' },
})
```

**Extract error message:**

```typescript
import { getErrorMessage } from '@repo/error/nextjs' // or @repo/error

const message = getErrorMessage(error)
```

## Initialize error reporting

Use `initErrorReporting` from the platform path. **Do NOT call it from `instrumentation.ts`**—use dedicated config files to avoid OpenTelemetry conflicts (see Next.js and OpenTelemetry below).

**Node/Fastify:**

```typescript
import { initErrorReporting } from '@repo/error/node'

initErrorReporting({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
})
```

**Next.js:** Use `error-reporting.server.ts`, `error-reporting.client.ts`, `sentry.edge.config.ts` with thin `sentry.server.config.ts` and `instrumentation-client.ts` shims. See [GlitchTip Next.js docs](https://glitchtip.com/sdkdocs/javascript-nextjs/).

## Next.js and OpenTelemetry

Do **not** call `initErrorReporting` inside `instrumentation.ts` `register()`. It can cause Next.js span attributes (e.g. `next.route`) to be lost. Use dedicated config files instead; `instrumentation.ts` should only import them and export `onRequestError`.

## No-DSN fallback

When no DSN is configured, errors are logged via the provided or default logger instead of being dropped. A DSN env var does not enable Sentry while `initErrorReporting` remains a no-op.

## Scripts

- `pnpm --filter @repo/error build` - Build package
- `pnpm --filter @repo/error checktypes` - Type-check
- `pnpm --filter @repo/error test` - Run tests
