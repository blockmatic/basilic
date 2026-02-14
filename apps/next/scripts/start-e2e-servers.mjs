#!/usr/bin/env node
/**
 * Starts Fastify (API) and Next.js servers for e2e tests.
 * Run in one terminal, then in another: PLAYWRIGHT_REUSE_SERVER=true pnpm test:e2e:reuse
 *
 * Use when Playwright's webServer spawns processes that get OOM killed (exit 137) on constrained VMs.
 */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(dirname(dirname(scriptDir)))

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

function killAll(signal = 'SIGTERM') {
  fastify.kill(signal)
  next.kill(signal)
}
process.on('SIGINT', () => {
  killAll()
  process.exit(0)
})
process.on('SIGTERM', () => {
  killAll()
  process.exit(0)
})

for (const proc of [fastify, next]) {
  proc.on('exit', code => {
    killAll('SIGKILL')
    process.exit(code ?? 1)
  })
}
