#!/usr/bin/env node
import { spawn } from 'node:child_process'
/**
 * Runs Next.js e2e tests with servers started separately.
 * Use when Playwright's webServer causes exit 137 (OOM kill) on constrained VMs.
 *
 * OPEN_ROUTER_API_KEY: loaded from apps/fastify/.env.test (local) or CI secrets.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

function loadEnvTest() {
  const path = join(repoRoot, 'apps/fastify/.env.test')
  if (!existsSync(path)) return {}
  const lines = readFileSync(path, 'utf8').split('\n')
  const out = {}
  for (const line of lines) {
    const idx = line.indexOf('=')
    if (idx < 0 || line.startsWith('#')) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1)
    out[key] = val
  }
  return out
}

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
    ...loadEnvTest(),
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
  const waitForExits = (timeoutMs = 2000) =>
    Promise.race([
      Promise.all([
        new Promise(r => fastify.once('exit', r)),
        new Promise(r => next.once('exit', r)),
      ]),
      new Promise(r => setTimeout(r, timeoutMs)),
    ])
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

  const pwArgs = ['-F', '@repo/next', 'exec', 'playwright', 'test', ...process.argv.slice(2)]
  const pw = spawn('pnpm', pwArgs, {
    cwd: repoRoot,
    env: { ...process.env, PLAYWRIGHT_REUSE_SERVER: 'true' },
    stdio: 'inherit',
  })
  const code = await new Promise(r => pw.on('exit', c => r(c ?? 1)))
  killAll('SIGTERM')
  await waitForExits()
  if (fastify.exitCode == null) fastify.kill('SIGKILL')
  if (next.exitCode == null) next.kill('SIGKILL')
  process.exit(code)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
