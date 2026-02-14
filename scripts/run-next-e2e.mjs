#!/usr/bin/env node
/**
 * Runs Next.js e2e tests with servers started separately.
 * Use when Playwright's webServer causes exit 137 (OOM kill) on constrained VMs.
 */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise(resolve => {
    const check = async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
        if (res.ok || res.status === 307) return resolve(true)
      } catch {
        // continue
      }
      if (Date.now() - start > timeoutMs) return resolve(false)
      setTimeout(check, 500)
    }
    check()
  })
}

async function main() {
  const build = spawn('pnpm', ['-F', '@repo/next', 'run', 'build:e2e'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const buildCode = await new Promise(r => build.on('exit', c => r(c ?? 1)))
  if (buildCode !== 0) process.exit(buildCode)

  const env = {
    ...process.env,
    USE_FAKE_EMAIL: 'true',
    PGLITE: 'true',
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
  }

  const fastify = spawn('pnpm', ['--filter', '@repo/fastify', 'start:ci'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit',
  })
  const next = spawn('pnpm', ['--filter', '@repo/next', 'start:e2e:server'], {
    cwd: repoRoot,
    env: { ...env, PORT: '3000' },
    stdio: 'inherit',
  })

  const killAll = (signal = 'SIGTERM') => {
    fastify.kill(signal)
    next.kill(signal)
  }
  process.on('SIGINT', () => {
    killAll()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    killAll()
    process.exit(143)
  })

  if (!(await waitForUrl('http://localhost:3001/health'))) {
    killAll('SIGKILL')
    process.exit(1)
  }
  if (!(await waitForUrl('http://localhost:3000'))) {
    killAll('SIGKILL')
    process.exit(1)
  }

  const pw = spawn('pnpm', ['-F', '@repo/next', 'exec', 'playwright', 'test'], {
    cwd: repoRoot,
    env: { ...process.env, PLAYWRIGHT_REUSE_SERVER: 'true' },
    stdio: 'inherit',
  })
  const code = await new Promise(r => pw.on('exit', c => r(c ?? 1)))
  killAll()
  process.exit(code)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
