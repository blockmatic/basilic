#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const nestedPackageJson = ['tools/create-basilic/package.json', '.deepsec/package.json']

function run({ cmd, args, cwd = repoRoot }) {
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit' })
  if (result.error) {
    console.error(result.error.message)
    exit(1)
  }
  if (result.status !== 0) exit(result.status ?? 1)
}

function readPkg({ path }) {
  return { pkg: JSON.parse(readFileSync(path, 'utf8')) }
}

function writePackageManager({ path, packageManager }) {
  const { pkg } = readPkg({ path })
  if (pkg.packageManager === packageManager) return
  writeFileSync(path, `${JSON.stringify({ ...pkg, packageManager }, null, 2)}\n`)
}

function main() {
  run({ cmd: 'corepack', args: ['use', 'pnpm@latest'] })
  const { pkg } = readPkg({ path: join(repoRoot, 'package.json') })
  const packageManager = pkg.packageManager
  if (typeof packageManager !== 'string' || !packageManager.startsWith('pnpm@')) {
    console.error('root package.json is missing a pnpm packageManager field')
    exit(1)
  }
  for (const rel of nestedPackageJson)
    writePackageManager({ path: join(repoRoot, rel), packageManager })
  run({ cmd: 'pnpm', args: ['update', '--latest', '--recursive'] })
  run({ cmd: 'pnpm', args: ['update', '--latest'], cwd: join(repoRoot, '.deepsec') })
}

main()
