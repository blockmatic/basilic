// Types-only entry point - never imported at runtime
// Conditional exports route directly to server.js or client.js

// Re-export logger value for TypeScript - actual implementation comes from conditional exports
// Runtime resolves to either client.ts (browser) or server.ts (node)
export { logger } from './client.js'
export type { Logger, LogLevel } from './types.js'
