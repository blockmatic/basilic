# @basilic/tools

Development tools enabled by feature flags for debugging and development purposes.

## Features

- Dev tools hooks for conditional feature enabling
- VConsole integration for mobile debugging
- Nuqs debug utilities
- Feature flag support

## Installation

```bash
bun add @basilic/tools
```

## Peer Dependencies

This package requires the following peer dependencies (provided by your app):

- `react` ^19.0.0
- `react-dom` ^19.0.0

## Usage

### Dev Tools Hook

```tsx
'use client'

import { useDevtools } from '@basilic/tools'

function App() {
  useDevtools() // Enables dev tools when feature flag is enabled

  return <div>Your app</div>
}
```

### Individual Tools

```tsx
'use client'

import { useVConsole, useNuqsDebug } from '@basilic/tools'

function DevTools() {
  useVConsole() // Enable VConsole for mobile debugging
  useNuqsDebug() // Enable Nuqs debug logging
}
```

## Feature Flags

Enable dev tools conditionally using environment variables or feature flags:

```tsx
'use client'

import { useDevtools } from '@basilic/tools'

function App() {
  const enableDevTools = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true'

  if (enableDevTools) {
    useDevtools()
  }

  return <div>Your app</div>
}
```

## Related Packages

- [@basilic/ui](../ui/README.md) - Shared UI components (dev tools may integrate with UI components)

## License

PROPRIETARY
