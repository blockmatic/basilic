#!/usr/bin/env node
/**
 * One-time Portless machine setup: trust the local CA and start the HTTPS proxy.
 * Idempotent. Skips in CI. `pnpm dev` starts the proxy again when it is down,
 * once, before Turbo — not once per app inside the TUI.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)

export function envFlagIsTrue(value) {
  return value === '1' || value === 'true'
}

function runPortless(args, { stdio = 'inherit' } = {}) {
  return spawnSync('pnpm', ['exec', 'portless', ...args], {
    cwd: repoRoot,
    stdio,
    encoding: 'utf-8',
    shell: process.platform === 'win32',
  })
}

function isMain() {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === resolve(entry)
}

export function main({ env = process.env, log = console } = {}) {
  if (envFlagIsTrue(env.CI)) {
    log.log('\n⏭  setup:portless skipped (CI=1)\n')
    return 0
  }

  log.log('\n🔐 Setting up Portless (named https://*.localhost URLs)...\n')
  log.log('This may ask for OS confirmation or sudo to trust the local CA and bind port 443.')
  log.log('Re-running this script is safe. Daily `pnpm dev` does not repeat these steps.\n')

  const trust = runPortless(['trust'])
  if (trust.status !== 0) {
    log.error(
      '\n❌ portless trust failed. Fix the prompt above, then retry `pnpm setup:portless`.\n',
    )
    return trust.status ?? 1
  }

  const proxy = runPortless(['proxy', 'start'])
  if (proxy.status !== 0) {
    log.error(
      '\n❌ portless proxy start failed. Port 443 may need elevated permissions.\nRun `pnpm exec portless doctor` for details.\n',
    )
    return proxy.status ?? 1
  }

  log.log('\n✅ Portless setup complete. Canonical local URLs:')
  log.log('   https://basilic.localhost')
  log.log('   https://api.basilic.localhost')
  log.log('   https://docu.basilic.localhost')
  log.log('   https://email.basilic.localhost')
  log.log('   https://agents.basilic.localhost')
  log.log(
    '\nExisting .env files are not overwritten. Update app URLs to those hosts if they still use localhost:<port>.',
  )
  log.log(
    'After reboot, `pnpm exec portless proxy start` or `portless service install` keeps :443 available.\n',
  )
  return 0
}

if (isMain()) process.exit(main())
