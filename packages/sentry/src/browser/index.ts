// Re-export core functionality (types)
export * from '../core/index.js'

// Single public interface: captureError. Init Sentry per Sentry browser docs.
export { captureError } from './capture.js'
