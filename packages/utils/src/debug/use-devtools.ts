'use client'
import { useNuqsDebug } from './use-nuqs-debug.js'
import { useVConsole } from './use-vconsole.js'

export * from './use-nuqs-debug.js'
export * from './use-vconsole.js'

/**
 * Composite hook that combines VConsole (mobile debug panel) and nuqs debug toggles.
 * Use when you need a single entry point for client-side debug controls.
 *
 * @returns Combined debug state and toggles: `isDebugEnabled`, `toggleDebug`, `isNuqsDebugEnabled`, `toggleNuqsDebug`
 */
export function useDevtools() {
  return {
    ...useVConsole(),
    ...useNuqsDebug(),
  }
}
