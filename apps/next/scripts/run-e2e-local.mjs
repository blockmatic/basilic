#!/usr/bin/env node
/**
 * E2E local: build, spawn Fastify + Next, poll until healthy, run Playwright, cleanup on exit.
 * No wait-on. Uses ALLOW_TEST, PGLITE, DB-backed token for @test.ai.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const nextDir = dirname(scriptDir)
const repoRoot = dirname(dirname(nextDir))

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
  // eslint-disable-next-line turbo/no-undeclared-env-vars -- set by root test:e2e script
  if (!process.env.SKIP_KILL_PORTS) {
    try {
      spawnSync('bash', [join(repoRoot, 'scripts/kill-test-servers.sh')], {
        cwd: repoRoot,
        stdio: 'pipe',
      })
    } catch {
      /* ignore - ports may not be in use or bash unavailable */
    }
  }
  const build = spawn('pnpm', ['-F', '@repo/next', 'run', 'build:e2e'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const buildCode = await new Promise(r => build.on('exit', c => r(c ?? 1)))
  if (buildCode !== 0) process.exit(buildCode)

  const loaded = loadEnvTest()
  const env = {
    ...process.env,
    ...loaded,
    ALLOW_TEST: 'true',
    PGLITE: 'true',
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    JWT_SECRET:
      loaded.JWT_SECRET ?? process.env.JWT_SECRET ?? 'e2e-jwt-secret-min-32-chars-for-tests',
  }

  const fastify = spawn('node', ['--import', 'tsx', 'server.ts'], {
    cwd: join(repoRoot, 'apps/fastify'),
    env,
    stdio: 'ignore',
  })
  const next = spawn('pnpm', ['exec', 'next', 'start'], {
    cwd: nextDir,
    env: { ...env, PORT: '3000' },
    stdio: 'ignore',
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

  const cleanup = () => {
    killAll('SIGTERM')
  }
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

  const userArgs = process.argv.slice(2).filter(a => a !== '--')
  const hasWorkers = userArgs.some(a => a.startsWith('--workers='))
  const pwArgs = ['exec', 'playwright', 'test', ...(hasWorkers ? [] : ['--workers=1']), ...userArgs]
  const hasProjectArg = pwArgs.some(a => a.startsWith('--project='))
  const explicitWalletProject = userArgs.some(
    a => a.includes('wallet-metamask') || a.includes('wallet-solana'),
  )
  // eslint-disable-next-line turbo/no-undeclared-env-vars -- set by root test:e2e
  const skipWalletE2E = process.env.SKIP_WALLET_E2E === '1'
  const runWalletSpecs = (!hasProjectArg && !skipWalletE2E) || explicitWalletProject
  if (!hasProjectArg && skipWalletE2E) pwArgs.push('--project=auth', '--project=chromium')
  let skipWalletSolana = false
  const synpressNeedsXvfb = process.platform === 'linux' && !env.DISPLAY
  if (runWalletSpecs) {
    const metamaskCmd = synpressNeedsXvfb ? 'xvfb-run' : 'pnpm'
    const metamaskArgs = synpressNeedsXvfb
      ? ['--auto-servernum', '--', 'pnpm', 'synpress:metamask']
      : ['synpress:metamask']
    const metamaskBuild = spawnSync(metamaskCmd, metamaskArgs, {
      cwd: nextDir,
      env,
      stdio: 'inherit',
    })
    if (metamaskBuild.status !== 0) {
      process.stderr.write('E2E local: Synpress MetaMask cache build failed\n')
      process.exit(metamaskBuild.status ?? 1)
    }
    const phantomCmd = synpressNeedsXvfb ? 'xvfb-run' : 'pnpm'
    const phantomArgs = synpressNeedsXvfb
      ? ['--auto-servernum', '--', 'pnpm', 'synpress:phantom']
      : ['synpress:phantom']
    const phantomBuild = spawnSync(phantomCmd, phantomArgs, {
      cwd: nextDir,
      env,
      stdio: 'inherit',
    })
    if (phantomBuild.status !== 0) {
      process.stderr.write(
        'E2E local: Phantom cache build failed (crx-backup.phantom.dev may be unreachable), skipping wallet-solana tests\n',
      )
      skipWalletSolana = true
    }
  }

  const finalPwArgs =
    skipWalletSolana &&
    !pwArgs.some(a => a.startsWith('--project=')) &&
    !pwArgs.some(a => a.includes('wallet-solana'))
      ? [...pwArgs, '--project=auth', '--project=wallet-metamask', '--project=chromium']
      : pwArgs

  // Synpress wallet specs need a display; use xvfb on Linux when no DISPLAY
  /* eslint-disable turbo/no-undeclared-env-vars -- DISPLAY is runtime check for virtual display */
  const needsXvfb =
    process.platform === 'linux' &&
    !process.env.DISPLAY &&
    (runWalletSpecs ||
      finalPwArgs.some(a => a.includes('wallet-metamask') || a.includes('wallet-solana')))
  /* eslint-enable turbo/no-undeclared-env-vars */
  const [pwCmd, pwArgsFinal] = needsXvfb
    ? ['xvfb-run', ['--auto-servernum', '--', 'pnpm', ...finalPwArgs]]
    : ['pnpm', finalPwArgs]

  const pw = spawn(pwCmd, pwArgsFinal, {
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
  if (fastify.exitCode == null) fastify.kill('SIGKILL')
  if (next.exitCode == null) next.kill('SIGKILL')
  process.exit(exitCode)
}

main().catch(err => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
