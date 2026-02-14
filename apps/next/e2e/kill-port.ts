import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/** Returns PID(s) listening on port, or empty string if none */
async function getPortPids(port: number): Promise<string> {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port} 2>/dev/null || true`)
    return stdout.trim()
  } catch {
    return ''
  }
}

export async function killPort(port: number): Promise<void> {
  try {
    const { stdout: ssOutput } = await execAsync(`ss -tlnp 2>/dev/null | grep :${port} || true`)
    if (ssOutput.trim()) {
      const pidMatch = ssOutput.match(/pid=(\d+)/)
      if (pidMatch) {
        await execAsync(`kill -9 ${pidMatch[1]} 2>/dev/null || true`)
        return
      }
    }
  } catch {
    // Continue
  }

  try {
    const { stdout: netstatOutput } = await execAsync(
      `netstat -tlnp 2>/dev/null | grep :${port} || true`,
    )
    if (netstatOutput.trim()) {
      const pidMatch = netstatOutput.match(/\s+(\d+)\/node/)
      if (pidMatch) {
        await execAsync(`kill -9 ${pidMatch[1]} 2>/dev/null || true`)
        return
      }
    }
  } catch {
    // Continue
  }

  try {
    await execAsync(`fuser -k ${port}/tcp 2>/dev/null || true`)
  } catch {
    // Ignore
  }

  try {
    const { stdout } = await execAsync(`lsof -ti:${port} 2>/dev/null || true`)
    if (stdout.trim()) {
      for (const pid of stdout.trim().split('\n')) {
        try {
          await execAsync(`kill -9 ${pid} 2>/dev/null || true`)
        } catch {
          // Ignore
        }
      }
    }
  } catch {
    // Ignore
  }
}

export async function isPortInUse(port: number): Promise<boolean> {
  const pids = await getPortPids(port)
  return pids.length > 0
}
