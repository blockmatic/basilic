# Async utils (`@repo/utils/async`)

Helpers for delayed execution and time-bounded fetch. No peer dependencies.

## API

### `delay(ms)`

Resolves after the given milliseconds.

```ts
import { delay } from '@repo/utils/async'

await delay(1000) // 1 second
```

### `fetchWithTimeout({ url, options?, timeoutMs? })`

Fetches with a timeout via `AbortController`. Default `timeoutMs` is 5000.

```ts
import { fetchWithTimeout } from '@repo/utils/async'

const res = await fetchWithTimeout({
  url: 'https://api.example.com/data',
  options: { headers: { Authorization: 'Bearer token' } },
  timeoutMs: 10_000,
})
```

Use this for external calls instead of raw `fetch` to avoid unbounded waits.
