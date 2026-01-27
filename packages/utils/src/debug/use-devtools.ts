'use client'
import { useNuqsDebug } from './use-nuqs-debug.js'
import { useVConsole } from './use-vconsole.js'

export * from './use-nuqs-debug.js'
export * from './use-vconsole.js'

export function useDevtools() {
  return {
    ...useVConsole(),
    ...useNuqsDebug(),
  }
}
