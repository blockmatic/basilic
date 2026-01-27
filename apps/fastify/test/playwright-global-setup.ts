import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

async function _killPort(port: number) {
  try {
    // Try ss first (modern Linux)
    const { stdout: ssOutput } = await execAsync(`ss -tlnp 2>/dev/null | grep :${port} || true`)
    if (ssOutput.trim()) {
      // Extract PID from ss output: users:(("node",pid=909123,fd=38))
      const pidMatch = ssOutput.match(/pid=(\d+)/)
      if (pidMatch) {
        await execAsync(`kill -9 ${pidMatch[1]} 2>/dev/null || true`)
        return
      }
    }
  } catch {
    // Continue to next method
  }

  try {
    // Try netstat (fallback)
    const { stdout: netstatOutput } = await execAsync(
      `netstat -tlnp 2>/dev/null | grep :${port} || true`,
    )
    if (netstatOutput.trim()) {
      // Extract PID from netstat output
      const pidMatch = netstatOutput.match(/\s+(\d+)\/node/)
      if (pidMatch) {
        await execAsync(`kill -9 ${pidMatch[1]} 2>/dev/null || true`)
        return
      }
    }
  } catch {
    // Continue to next method
  }

  try {
    // Try fuser (Linux)
    await execAsync(`fuser -k ${port}/tcp 2>/dev/null || true`)
  } catch {
    // Ignore
  }

  try {
    // Try lsof (macOS/Linux)
    const { stdout } = await execAsync(`lsof -ti:${port} 2>/dev/null || true`)
    if (stdout.trim()) {
      const pids = stdout.trim().split('\n')
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid} 2>/dev/null || true`)
        } catch {
          // Ignore individual kill failures
        }
      }
    }
  } catch {
    // Ignore if no process found or command fails
  }
}

async function globalSetup() {
  // Global setup - no port cleanup here to avoid killing Playwright's webServer
  // Port cleanup is handled by globalTeardown after tests complete
  // If there's a port conflict, Playwright's reuseExistingServer will handle it
}

export default globalSetup
