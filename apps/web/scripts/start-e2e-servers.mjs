#!/usr/bin/env node
/**
 * Starts Fastify (API) and Next.js servers for e2e tests.
 * Run in one terminal, then in another: pnpm test:e2e
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
  ALLOW_TEST: 'true',
  PGLITE: 'true',
  NODE_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3001',
}

const api = spawn('pnpm', ['--filter', '@repo/api', 'start:ci'], {
  cwd: repoRoot,
  env,
  stdio: 'inherit',
})
const web = spawn('pnpm', ['--filter', '@repo/web', 'start:e2e:server'], {
  cwd: repoRoot,
  env: { ...env, PORT: '3000' },
  stdio: 'inherit',
})

function killAll(signal = 'SIGTERM') {
  api.kill(signal)
  web.kill(signal)
}
process.on('SIGINT', () => {
  killAll()
  process.exit(0)
})
process.on('SIGTERM', () => {
  killAll()
  process.exit(0)
})

for (const proc of [api, web])
  proc.on('exit', code => {
    killAll('SIGKILL')
    process.exit(code ?? 1)
  })
