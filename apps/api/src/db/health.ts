import { Pool } from 'pg'
import { env } from '../lib/env.js'

const maxRetries = 10
const initialRetryDelay = 1000 // 1 second
const maxWaitTime = 30000 // 30 seconds

/**
 * Wait for database connection to be available
 * Retries with exponential backoff until connection succeeds or timeout is reached
 */
export async function waitForDatabase(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  // Skip health check for PGLite (doesn't need connection check)
  if (env.PGLITE === true || env.NODE_ENV === 'test') return

  const startTime = Date.now()
  let attempt = 0

  while (attempt < maxRetries) {
    // Calculate timeout per attempt: distribute maxWaitTime across retries
    const connectionTimeoutMillis = Math.max(
      Math.floor(maxWaitTime / maxRetries),
      1000, // Minimum 1 second timeout
    )
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis,
    })

    try {
      // Try to connect
      const client = await pool.connect()
      client.release()
      await pool.end()

      const elapsed = Date.now() - startTime
      logger?.info(`Database connection established (${elapsed}ms)`)
      return
    } catch (err) {
      await pool.end()
      attempt++

      const elapsed = Date.now() - startTime
      if (elapsed >= maxWaitTime) {
        logger?.error(`Database connection timeout after ${maxWaitTime}ms`, err)
        throw new Error(
          `Database connection failed after ${maxWaitTime}ms. Make sure your database is running and accessible via DATABASE_URL. Error: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        )
      }

      if (attempt < maxRetries) {
        const delay = Math.min(initialRetryDelay * 2 ** (attempt - 1), 5000)
        logger?.info(
          `Database connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`,
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  const elapsed = Date.now() - startTime
  logger?.error(`Database connection failed after ${attempt} attempts (${elapsed}ms)`)
  throw new Error(
    `Database connection failed after ${attempt} attempts. Make sure your database is running and accessible via DATABASE_URL`,
  )
}
