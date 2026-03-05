'use client'

import { useLocalStorageState } from 'ahooks'
import { useEffect } from 'react'

/**
 * Enables nuqs URL state debug mode (persisted in localStorage).
 * When enabled, nuqs logs debug info for search param updates.
 *
 * @returns `{ isNuqsDebugEnabled, toggleNuqsDebug }`
 */
export function useNuqsDebug() {
  const [debug, setDebug] = useLocalStorageState<string>('debug', {
    defaultValue: '',
  })

  useEffect(() => {
    if (debug !== 'nuqs') setDebug('nuqs')
  }, [debug, setDebug])

  return {
    isNuqsDebugEnabled: debug === 'nuqs',
    toggleNuqsDebug: () => setDebug(debug === 'nuqs' ? '' : 'nuqs'),
  }
}
