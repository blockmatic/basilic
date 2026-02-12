# Error utils (`@repo/utils/error`)

Type-safe error normalization and Result-style async handling. No peer dependencies.

## API

### `getErrorMessage(error)`

Extracts a string message from any thrown value.

```ts
import { getErrorMessage } from '@repo/utils/error'

try {
  await risky()
} catch (e) {
  console.error(getErrorMessage(e))
}
```

### `toErrorWithMessage(maybeError)`

Normalizes unknown to `{ message: string }` (Error, string, or fallback).

### `isErrorWithMessage(error)`

Type guard: `error is ErrorWithMessage`.

### `tryCatch(promiseOrFn)`

Wraps a promise or async function; returns `{ data, error }` (one undefined). Errors are normalized.

```ts
import { tryCatch } from '@repo/utils/error'

const { error, data } = await tryCatch(fetchUser(id))
if (error) return console.error(error.message)
// data is defined here
```

### Types

- **ErrorWithMessage** — `{ message: string }`
- **Result<T, E>** — `{ data: T; error?: undefined } | { data?: undefined; error: E }`

For Sentry reporting use `@repo/sentry` (e.g. `captureError`); use this package only for message extraction and Result handling.
