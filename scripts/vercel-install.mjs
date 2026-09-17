#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function run({ cmd, args }) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: 'inherit' })
  if (result.error) {
    console.error(result.error.message)
    exit(1)
  }
  if (result.status !== 0) exit(result.status ?? 1)
}

function pnpmVersion() {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
  const match =
    typeof pkg.packageManager === 'string' ? pkg.packageManager.match(/^pnpm@([^+]+)/) : null
  if (!match) {
    console.error('package.json is missing a pnpm packageManager field')
    exit(1)
  }
  return { version: match[1] }
}

const { version } = pnpmVersion()
run({ cmd: 'npm', args: ['install', '-g', `pnpm@${version}`, '--foreground-scripts'] })
run({ cmd: 'pnpm', args: ['install'] })
