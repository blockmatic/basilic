#!/usr/bin/env node
/**
 * Run E2E tests locally: Fastify API E2E, then Next app E2E.
 * Spawns servers locally (no external URLs). Used by pnpm qa.
 */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd: repoRoot, stdio: 'inherit', ...opts })
    proc.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))))
  })
}

async function main() {
  await run('pnpm', ['-F', '@repo/fastify', 'test:e2e'])
  await run('pnpm', ['-F', '@repo/next', 'test:e2e:local'])
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
