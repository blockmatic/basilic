#!/usr/bin/env node
/**
 * E2E local: spawn Fastify API, poll until healthy, run Playwright, cleanup on exit.
 * No wait-on. Uses ALLOW_TEST, PGLITE, NODE_ENV=test.
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const fastifyDir = dirname(scriptDir)
const repoRoot = dirname(dirname(fastifyDir))

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function waitForUrl(url, timeoutMs = 60_000) {
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
  const loaded = loadEnvTest()
  const env = {
    ...process.env,
    ...loaded,
    ALLOW_TEST: 'true',
    PGLITE: 'true',
    NODE_ENV: 'test',
    JWT_SECRET:
      loaded.JWT_SECRET ?? process.env.JWT_SECRET ?? 'e2e-jwt-secret-min-32-chars-for-tests',
  }

  const fastify = spawn('pnpm', ['start:ci'], {
    cwd: fastifyDir,
    env,
    stdio: 'ignore',
  })

  const cleanup = () => fastify.kill('SIGTERM')
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  if (!(await waitForUrl('http://localhost:3001/health'))) {
    fastify.kill('SIGKILL')
    process.stderr.write('E2E local: API unreachable at http://localhost:3001/health\n')
    process.exit(1)
  }

  const pwArgs = ['exec', 'playwright', 'test', ...process.argv.slice(2)]
  const pw = spawn('pnpm', pwArgs, {
    cwd: fastifyDir,
    env: process.env,
    stdio: 'inherit',
  })
  let exitCode = 0
  pw.on('exit', c => {
    exitCode = c ?? 1
  })

  await new Promise(r => pw.on('exit', r))
  cleanup()
  const waitForExit = (timeoutMs = 5000) =>
    Promise.race([
      new Promise(r => fastify.once('exit', r)),
      new Promise(r => setTimeout(r, timeoutMs)),
    ])
  await waitForExit()
  if (fastify.exitCode == null) fastify.kill('SIGKILL')
  process.exit(exitCode)
}

main().catch(err => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
