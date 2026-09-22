#!/usr/bin/env node
/**
 * Daily local start: ensure Supabase Postgres and the Portless HTTPS proxy
 * are up, then Turbo TUI. The proxy starts here, once, with `--skip-trust`,
 * so port 443's sudo prompt is not trapped inside the TUI and Keychain is
 * left to `pnpm setup:portless`. Schema and identity seed run on Fastify boot.
 * Wipe remains `pnpm reset`. HTTP apps use https://*.localhost names.
 */
import { spawnSync } from 'node:child_process'
import https from 'node:https'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatLocalUrlBanner, localDevChildEnv, resolveLocalAppUrls } from './local-urls.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const turboDevConcurrency = '20'
const portlessProxyHeader = 'x-portless'

export function envFlagIsTrue(value) {
  return value === '1' || value === 'true'
}

export function shouldEnsurePortlessProxy({ env = process.env } = {}) {
  if (envFlagIsTrue(env.CI)) return false
  const portless = env.PORTLESS
  if (portless === '0' || portless === 'false' || portless === 'skip') return false
  return true
}

export function portlessProxyPort({ env = process.env } = {}) {
  const parsed = Number(env.PORTLESS_PORT)
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535) return parsed
  return 443
}

export function portlessProxyResponding({ port = 443, request = https.request } = {}) {
  return new Promise(resolveResponding => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        method: 'HEAD',
        timeout: 1000,
        rejectUnauthorized: false,
      },
      res => {
        res.resume()
        resolveResponding(res.headers[portlessProxyHeader] === '1')
      },
    )
    req.on('error', () => resolveResponding(false))
    req.on('timeout', () => {
      req.destroy()
      resolveResponding(false)
    })
    req.end()
  })
}

async function waitForPortlessProxy({ responding, attempts = 20, delayMs = 250 }) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await responding()) return true
    if (attempt < attempts - 1) await new Promise(resolveDelay => setTimeout(resolveDelay, delayMs))
  }
  return false
}

export async function ensurePortlessProxy({
  env = process.env,
  spawn = spawnSync,
  log = console,
  cwd = repoRoot,
  responding,
} = {}) {
  if (!shouldEnsurePortlessProxy({ env })) return { ok: true, skipped: true }
  const port = portlessProxyPort({ env })
  const isResponding = responding ?? (() => portlessProxyResponding({ port }))
  if (await isResponding()) return { ok: true, skipped: true }

  log.log(
    `\nPortless HTTPS proxy is not running. Starting it once before Turbo (port ${port} may ask for your password)...\n`,
  )
  const result = spawn(
    'pnpm',
    ['exec', 'portless', 'proxy', 'start', '--https', '--port', String(port), '--skip-trust'],
    { cwd, env, stdio: 'inherit', shell: process.platform === 'win32' },
  )
  if (result.status !== 0) {
    log.error(
      `\nFailed to start the Portless proxy on port ${port}.\nRun \`pnpm setup:portless\` in this terminal, then \`pnpm dev\`.\n`,
    )
    return { ok: false, status: result.status ?? 1 }
  }
  if (await waitForPortlessProxy({ responding: isResponding })) return { ok: true, skipped: false }
  log.error(
    `\nPortless proxy command finished but nothing is responding on port ${port}.\nRun \`pnpm exec portless doctor\`.\n`,
  )
  return { ok: false, status: 1 }
}

export function turboChildEnv({ env = process.env, urls } = {}) {
  return { ...localDevChildEnv({ env, ...(urls ? { urls } : {}) }), SKIP_DB_START: '1' }
}

export function turboDevCommand({ extraArgs = [] } = {}) {
  return {
    cmd: 'pnpm',
    args: ['exec', 'turbo', 'run', 'dev', `--concurrency=${turboDevConcurrency}`, ...extraArgs],
  }
}

function isMain() {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === resolve(entry)
}

async function main() {
  const proxy = await ensurePortlessProxy()
  if (!proxy.ok) process.exit(proxy.status ?? 1)

  if (!envFlagIsTrue(process.env.SKIP_DB_START)) {
    const db = spawnSync('pnpm', ['--filter', '@repo/db', 'db:start'], {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    if (db.status !== 0) {
      console.error(
        '\nFailed to start local Postgres. Start Docker Desktop, then run `pnpm db:start`.\nSet SKIP_DB_START=1 to skip.\n',
      )
      process.exit(db.status ?? 1)
    }
  }

  const urls = resolveLocalAppUrls({ cwd: repoRoot })
  console.log(`\n${formatLocalUrlBanner({ urls })}\n`)

  const { cmd, args } = turboDevCommand({ extraArgs: process.argv.slice(2) })
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: turboChildEnv({ urls }),
  })
  process.exit(result.status ?? 1)
}

if (isMain())
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
