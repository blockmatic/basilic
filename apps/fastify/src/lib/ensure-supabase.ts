import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const SUPABASE_START_TIMEOUT = 120000 // 2 minutes (matches Supabase config)
const STATUS_CHECK_INTERVAL = 2000 // 2 seconds

/**
 * Check if Supabase is running by checking status command
 */
async function isSupabaseRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('supabase status', {
      cwd: process.cwd(),
      timeout: 5000,
    })

    // Check if all services are running
    // Supabase status output contains service statuses
    // If services are running, we'll see "API URL", "DB URL", etc.
    return stdout.includes('API URL') && stdout.includes('DB URL')
  } catch {
    return false
  }
}

/**
 * Start Supabase and wait for it to be ready
 */
async function startSupabase(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  logger?.info('Starting Supabase local instance...')

  try {
    // Start Supabase (non-blocking)
    const startProcess = exec('supabase start', {
      cwd: process.cwd(),
    })

    // Wait for start command to complete with timeout
    await new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        startProcess.removeAllListeners()
      }

      // Set up timeout that kills process and rejects if fired
      timeoutId = setTimeout(() => {
        cleanup()
        startProcess.kill()
        reject(new Error(`Supabase start timed out after ${SUPABASE_START_TIMEOUT}ms`))
      }, SUPABASE_START_TIMEOUT)

      // Handle process close
      startProcess.on('close', code => {
        cleanup()
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Supabase start failed with exit code ${code}`))
        }
      })

      // Handle process error
      startProcess.on('error', err => {
        cleanup()
        reject(err)
      })
    })

    logger?.info('Supabase start command completed, waiting for services to be ready...')
  } catch (err) {
    logger?.error('Failed to start Supabase', err)
    throw err
  }
}

/**
 * Wait for Supabase services to be ready
 */
async function waitForSupabaseReady(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < SUPABASE_START_TIMEOUT) {
    if (await isSupabaseRunning()) {
      const elapsed = Date.now() - startTime
      logger?.info(`Supabase is ready (${elapsed}ms)`)
      return
    }

    await new Promise(resolve => setTimeout(resolve, STATUS_CHECK_INTERVAL))
  }

  throw new Error(`Supabase did not become ready within ${SUPABASE_START_TIMEOUT}ms`)
}

/**
 * Ensure Supabase local instance is running
 * Checks if running, starts if needed, and waits for readiness
 *
 * @throws If Supabase start fails (but not if CLI is not found - logs warning instead)
 */
export async function ensureSupabaseRunning(logger?: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
  warn: (msg: string, err?: unknown) => void
}): Promise<void> {
  // Check if Supabase CLI is available
  try {
    await execAsync('which supabase', { timeout: 2000 })
  } catch {
    logger?.warn(
      'Supabase CLI not found. Please install it or start Supabase manually with: pnpm db:start',
    )
    // Don't throw - allow user to start Supabase manually
    return
  }

  // Check if already running
  if (await isSupabaseRunning()) {
    logger?.info('Supabase is already running')
    return
  }

  // Start Supabase (throws if start fails)
  await startSupabase(logger)

  // Wait for readiness (throws if timeout)
  await waitForSupabaseReady(logger)
}
