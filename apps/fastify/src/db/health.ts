import { Pool } from 'pg'
import { env } from '../lib/env.js'

const MAX_RETRIES = 10
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_WAIT_TIME = 30000 // 30 seconds

/**
 * Wait for database connection to be available
 * Retries with exponential backoff until connection succeeds or timeout is reached
 */
export async function waitForDatabase(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  // Skip health check for test environment (PGLite doesn't need connection check)
  if (process.env.NODE_ENV === 'test') {
    return
  }

  const startTime = Date.now()
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    // Calculate timeout per attempt: distribute MAX_WAIT_TIME across retries
    const connectionTimeoutMillis = Math.max(
      Math.floor(MAX_WAIT_TIME / MAX_RETRIES),
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
      if (elapsed >= MAX_WAIT_TIME) {
        logger?.error(`Database connection timeout after ${MAX_WAIT_TIME}ms`, err)
        throw new Error(
          `Database connection failed after ${MAX_WAIT_TIME}ms: ${err instanceof Error ? err.message : String(err)}`,
        )
      }

      if (attempt < MAX_RETRIES) {
        const delay = Math.min(INITIAL_RETRY_DELAY * 2 ** (attempt - 1), 5000)
        logger?.info(
          `Database connection attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${delay}ms...`,
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  const elapsed = Date.now() - startTime
  logger?.error(`Database connection failed after ${attempt} attempts (${elapsed}ms)`)
  throw new Error(`Database connection failed after ${attempt} attempts`)
}
