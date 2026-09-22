import { Pool } from 'pg'
import { env } from '../lib/env.js'

const maxRetries = 10
const initialRetryDelay = 1000
const maxWaitTime = 30000

function postgresConnectionError({ detail, cause }: { detail: string; cause?: unknown }) {
  const suffix =
    cause instanceof Error ? `: ${cause.message}` : cause != null ? `: ${String(cause)}` : ''
  return new Error(`PostgreSQL connection failed (${detail})${suffix}`, { cause })
}

export async function waitForDatabase(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  if (env.PGLITE === true || env.NODE_ENV === 'test') return

  const startTime = Date.now()
  let attempt = 0

  while (attempt < maxRetries) {
    const connectionTimeoutMillis = Math.max(Math.floor(maxWaitTime / maxRetries), 1000)
    const pool = new Pool({
      connectionString: env.POSTGRES_URL,
      connectionTimeoutMillis,
    })

    try {
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
        throw postgresConnectionError({
          detail: `timeout after ${maxWaitTime}ms`,
          cause: err,
        })
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
  throw postgresConnectionError({ detail: `${attempt} attempts (${elapsed}ms)` })
}
