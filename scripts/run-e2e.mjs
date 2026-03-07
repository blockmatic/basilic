#!/usr/bin/env node
/**
 * Run E2E tests locally: Fastify API E2E, then Next app E2E.
 * Spawns servers locally (no external URLs). Used by pnpm qa.
 * Kills processes on ports 3000/3001 before starting (unless SKIP_KILL_PORTS=1).
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFile = fileURLToPath(import.meta.url)
const repoRoot = dirname(dirname(scriptFile))

function killPorts() {
  if (process.env.SKIP_KILL_PORTS) return
  const killScript = join(repoRoot, 'scripts', 'kill-test-servers.sh')
  if (!existsSync(killScript)) return
  try {
    spawnSync('bash', [killScript], { cwd: repoRoot, stdio: 'pipe' })
  } catch {
    /* ignore - ports may not be in use or bash unavailable */
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: repoRoot, stdio: 'inherit', ...opts })
    proc.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))))
  })
}

async function main() {
  killPorts()
  await run('pnpm', ['-F', '@repo/fastify', 'test:e2e:local'])
  killPorts()
  // Allow server shutdown and port release before starting Next e2e; 2s is conservative;
  // shorten if CI is stable.
  await new Promise(r => setTimeout(r, 2000))
  await run('pnpm', ['-F', '@repo/next', 'test:e2e:local'])
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
