// Re-export core functionality (types, utils)
export * from '../core/index.js'

// Next.js: use Sentry's standard setup (sentry.server.config.ts, instrumentation-client.ts, instrumentation.ts).
// This package only provides the common captureError interface.
export { captureError } from './capture.js'
