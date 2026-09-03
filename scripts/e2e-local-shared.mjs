#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
export const repoRoot = dirname(scriptDir)

export const defaultE2eEnv = {
  ALLOW_TEST: 'true',
  PGLITE: 'true',
  NODE_ENV: 'test',
  RATE_LIMIT_MAX: '10000',
  WEBAUTHN_RP_NAME: 'Test App',
  TOTP_ISSUER: 'Test App',
}

export const defaultE2eJwt = 'e2e-jwt-secret-min-32-chars-for-tests'

export function loadEnvTest() {
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

export function waitForUrl(url, timeoutMs = 60_000) {
  const start = Date.now()
  return new Promise(resolve => {
    const check = async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
        if (res.ok || res.status === 307) return resolve(true)
      } catch {
        // continue polling
      }
      if (Date.now() - start > timeoutMs) return resolve(false)
      setTimeout(check, 500)
    }
    check()
  })
}

export function killTestServerPorts() {
  if (process.env.SKIP_KILL_PORTS) return
  try {
    spawnSync('bash', [join(repoRoot, 'scripts/kill-test-servers.sh')], {
      cwd: repoRoot,
      stdio: 'pipe',
    })
  } catch {
    // ports may not be in use
  }
}

export function buildE2eSpawnEnv({ loaded = loadEnvTest(), extra = {} } = {}) {
  const jwt = loaded.JWT_SECRET ?? process.env.JWT_SECRET ?? defaultE2eJwt
  return {
    ...process.env,
    ...loaded,
    ...defaultE2eEnv,
    WEBAUTHN_RP_NAME:
      loaded.WEBAUTHN_RP_NAME ?? process.env.WEBAUTHN_RP_NAME ?? defaultE2eEnv.WEBAUTHN_RP_NAME,
    JWT_SECRET: jwt,
    ...extra,
  }
}
