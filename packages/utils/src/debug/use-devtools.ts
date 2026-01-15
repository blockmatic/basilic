'use client'
import { useNuqsDebug } from './use-nuqs-debug'
import { useVConsole } from './use-vconsole'

export * from './use-nuqs-debug'
export * from './use-vconsole'

export function useDevtools() {
  return {
    ...useVConsole(),
    ...useNuqsDebug(),
  }
}
