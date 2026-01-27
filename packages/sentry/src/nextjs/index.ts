// Re-export core functionality (types, utils)
export * from '../core/index.js'

// Export Next.js-specific Sentry functions
export { captureError } from './capture.js'
export type { InitSentryOptions } from './sentry.js'
export { initSentry } from './sentry.js'
