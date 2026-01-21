/**
 * Shared initialization state for serverless function instances
 * Used to track initialization status across API route and health check
 */

let isInitialized = false
let initializationPromise: Promise<void> | null = null

/**
 * Get current initialization status
 */
export function getInitializationStatus(): boolean {
  return isInitialized
}

/**
 * Set initialization status
 */
export function setInitializationStatus(status: boolean): void {
  isInitialized = status
}

/**
 * Get or create initialization promise lock
 */
export function getInitializationPromise(): Promise<void> | null {
  return initializationPromise
}

/**
 * Set initialization promise lock
 */
export function setInitializationPromise(promise: Promise<void> | null): void {
  initializationPromise = promise
}
