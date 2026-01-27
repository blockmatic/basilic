'use client'

import { useLocalStorageState } from 'ahooks'
import { useEffect } from 'react'

export function useNuqsDebug() {
  const [debug, setDebug] = useLocalStorageState<string>('debug', {
    defaultValue: '',
  })

  useEffect(() => {
    if (debug !== 'nuqs') {
      setDebug('nuqs')
    }
  }, [debug, setDebug])

  return {
    isNuqsDebugEnabled: debug === 'nuqs',
    toggleNuqsDebug: () => setDebug(debug === 'nuqs' ? '' : 'nuqs'),
  }
}
