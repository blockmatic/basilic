'use client'

import { useEffect } from 'react'
import { useLocalStorage } from 'react-use'

export function useNuqsDebug() {
  const [debug, setDebug] = useLocalStorage('debug', '')

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
