'use client'

import { createContext, useContext } from 'react'
import type { ReactApiConfigValue } from './setup'

/**
 * React context for API client and query configuration.
 * Used internally by hooks to access the API client instance.
 */
const ReactApiContext = createContext<ReactApiConfigValue | null>(null)

/**
 * Hook to access React API configuration from context.
 *
 * Returns the API client instance and query client defaults configured in `ReactApiProvider`.
 * Must be used within a `ReactApiProvider` component.
 *
 * @returns React API configuration value
 * @throws Error if used outside of `ReactApiProvider`
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, queryClientDefaults } = useReactApiConfig()
 *   // Use client or defaults...
 * }
 * ```
 */
export function useReactApiConfig(): ReactApiConfigValue {
  const context = useContext(ReactApiContext)
  if (!context) {
    throw new Error('useReactApiConfig must be used within ApiProvider')
  }
  return context
}

/**
 * React context for API client and query configuration.
 * Exported for advanced use cases (e.g., custom hooks that need direct context access).
 */
export { ReactApiContext }
