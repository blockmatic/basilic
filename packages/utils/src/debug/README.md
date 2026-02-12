# Debug (`@repo/utils/debug`)

Client-only React hooks for VConsole (mobile debug panel) and nuqs URL-state debug. Use in dev or behind a feature flag.

**Peer dependencies:** `react`, `ahooks`, `nuqs`, `vconsole`.

## API

### `useDevtools()`

Combines VConsole and nuqs debug. Returns `isDebugEnabled`, `toggleDebug`, `isNuqsDebugEnabled`, `toggleNuqsDebug`.

```ts
import { useDevtools } from '@repo/utils/debug'

function App() {
  const { isDebugEnabled, toggleDebug, isNuqsDebugEnabled, toggleNuqsDebug } = useDevtools()
  // ...
}
```

### `useVConsole()`

Enables/disables VConsole; state syncs with `?debug=true|false` and localStorage.

```ts
import { useVConsole } from '@repo/utils/debug'

const { isDebugEnabled, toggleDebug } = useVConsole()
```

### `useNuqsDebug()`

Toggles nuqs debug mode (persisted in localStorage). When enabled, nuqs logs search-param updates.

```ts
import { useNuqsDebug } from '@repo/utils/debug'

const { isNuqsDebugEnabled, toggleNuqsDebug } = useNuqsDebug()
```
