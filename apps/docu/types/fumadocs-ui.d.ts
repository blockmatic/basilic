// Fix React type version mismatch between fumadocs-ui and app React types
// This is a known issue with React 19 and multiple type definitions
declare module 'fumadocs-ui/*' {
  //import type { ComponentType, ReactNode } from 'react'
  export * from 'fumadocs-ui'
}
