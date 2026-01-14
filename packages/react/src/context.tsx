import { createContext, useContext } from 'react'
import type { createReactApiConfig } from './setup.js'

type ReactApiConfigContext = ReturnType<typeof createReactApiConfig>

const ReactApiContext = createContext<ReactApiConfigContext | null>(null)

export function useReactApiConfig() {
  const context = useContext(ReactApiContext)
  if (!context) {
    throw new Error('useReactApiConfig must be used within ReactApiProvider')
  }
  return context
}

export { ReactApiContext }
