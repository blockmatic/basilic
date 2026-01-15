/**
 * Delays execution for the specified number of milliseconds.
 *
 * @param ms - Number of milliseconds to delay
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```ts
 * await delay(1000) // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
