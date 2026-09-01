#!/usr/bin/env node
/**
 * E2E local: spawn Fastify API, poll until healthy, run Playwright, cleanup on exit.
 * No wait-on. Uses ALLOW_TEST, PGLITE, NODE_ENV=test.
 * Forces AI_PROVIDER=anthropic and strips Open Router/Ollama/AI_DEFAULT_MODEL (parity with Vitest + web E2E).
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const fastifyDir = dirname(scriptDir)
const repoRoot = dirname(dirname(fastifyDir))

function loadEnvTest() {
  const path = join(repoRoot, 'apps/api/.env.test')
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
  if (!process.env.SKIP_KILL_PORTS)
    try {
      spawnSync('bash', [join(repoRoot, 'scripts/kill-test-servers.sh')], {
        cwd: repoRoot,
        stdio: 'pipe',
      })
    } catch {
      /* ignore */
    }

  const loaded = loadEnvTest()
  const jwtSecret =
    loaded.JWT_SECRET ?? process.env.JWT_SECRET ?? 'e2e-jwt-secret-min-32-chars-for-tests'
  const anthropicApiKey = loaded.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY
  if (!anthropicApiKey) {
    process.stderr.write(
      'E2E local: ANTHROPIC_API_KEY must be set in .env.test or process.env when AI_PROVIDER is anthropic. Refusing to run without it.\n',
    )
    process.exit(1)
  }
  const env = {
    ...process.env,
    ...loaded,
    ALLOW_TEST: 'true',
    PGLITE: 'true',
    NODE_ENV: 'test',
    WEBAUTHN_RP_NAME: loaded.WEBAUTHN_RP_NAME ?? process.env.WEBAUTHN_RP_NAME ?? 'Test App',
    JWT_SECRET: jwtSecret,
    AI_PROVIDER: 'anthropic',
    ANTHROPIC_API_KEY: anthropicApiKey,
  }
  delete env.OPEN_ROUTER_API_KEY
  delete env.OLLAMA_BASE_URL
  delete env.AI_DEFAULT_MODEL

  const fastify = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
    cwd: fastifyDir,
    env,
    stdio: 'ignore',
  })

  fastify.on('error', err => {
    process.stderr.write(`fastify spawn error: ${String(err)}\n`)
    process.exit(1)
  })
  fastify.on('exit', (code, signal) => {
    if (signal === 'SIGTERM') return
    if (code !== 0 && code != null) {
      process.stderr.write(`fastify exited with code ${code}\n`)
      process.exit(1)
    }
    if (signal) {
      process.stderr.write(`fastify exited with signal ${signal}\n`)
      process.exit(1)
    }
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

  const userArgs = process.argv.slice(2)
  const hasWorkers = userArgs.some(a => a.startsWith('--workers='))
  const pwArgs = ['exec', 'playwright', 'test', ...(hasWorkers ? [] : ['--workers=1']), ...userArgs]
  const pw = spawn('pnpm', pwArgs, {
    cwd: fastifyDir,
    env,
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
