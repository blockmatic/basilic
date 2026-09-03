#!/usr/bin/env node
/**
 * E2E local: build, spawn Fastify + Next, poll until healthy, run Playwright, cleanup on exit.
 * When SKIP_BUILD=1, skip build step (assumes .next exists with NEXT_PUBLIC_API_URL=http://localhost:3001).
 */
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildE2eSpawnEnv,
  killTestServerPorts,
  loadEnvTest,
  repoRoot,
  waitForUrl,
} from '../../../scripts/e2e-local-shared.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const nextDir = dirname(scriptDir)

async function main() {
  killTestServerPorts()

  if (!process.env.SKIP_BUILD) {
    const loadedForBuild = loadEnvTest()
    const buildEnv = buildE2eSpawnEnv({ loaded: loadedForBuild })
    const build = spawn('pnpm', ['-F', '@repo/web', 'run', 'build:e2e'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: buildEnv,
    })
    const buildCode = await new Promise(r => build.on('exit', c => r(c ?? 1)))
    if (buildCode !== 0) process.exit(buildCode)
  }

  const loaded = loadEnvTest()
  const env = buildE2eSpawnEnv({
    loaded,
    extra: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      AI_PROVIDER: 'anthropic',
    },
  })
  delete env.OPEN_ROUTER_API_KEY
  delete env.OLLAMA_BASE_URL

  const api = spawn('node', ['--import', 'tsx', 'server.ts'], {
    cwd: join(repoRoot, 'apps/api'),
    env,
    stdio: 'inherit',
  })
  const web = spawn('pnpm', ['exec', 'next', 'start'], {
    cwd: nextDir,
    env: { ...env, PORT: '3000' },
    stdio: 'inherit',
  })

  const killAll = (signal = 'SIGTERM') => {
    api.kill(signal)
    web.kill(signal)
  }
  const waitForExits = (timeoutMs = 2000) =>
    Promise.race([
      Promise.all([new Promise(r => api.once('exit', r)), new Promise(r => web.once('exit', r))]),
      new Promise(r => setTimeout(r, timeoutMs)),
    ])

  const cleanup = () => killAll('SIGTERM')
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  if (!(await waitForUrl('http://localhost:3001/health'))) {
    killAll('SIGKILL')
    process.stderr.write('E2E local: API unreachable at http://localhost:3001/health\n')
    process.exit(1)
  }
  if (!(await waitForUrl('http://localhost:3000'))) {
    killAll('SIGKILL')
    process.stderr.write('E2E local: App unreachable at http://localhost:3000\n')
    process.exit(1)
  }
  await new Promise(r => setTimeout(r, 2000))

  const userArgs = process.argv.slice(2).filter(a => a !== '--')
  const hasWorkers = userArgs.some(a => a.startsWith('--workers='))
  const pwArgs = ['exec', 'playwright', 'test', ...(hasWorkers ? [] : ['--workers=1']), ...userArgs]

  const pw = spawn('pnpm', pwArgs, {
    cwd: nextDir,
    env,
    stdio: 'inherit',
  })
  let exitCode = 0
  pw.on('exit', c => {
    exitCode = c ?? 1
  })

  await new Promise(r => pw.on('exit', r))
  cleanup()
  await waitForExits(5000)
  if (api.exitCode == null) api.kill('SIGKILL')
  if (web.exitCode == null) web.kill('SIGKILL')
  process.exit(exitCode)
}

main().catch(err => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
