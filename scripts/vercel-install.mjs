#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

import { pnpmVersion, resolveGlobalPnpm } from './vercel-pnpm.mjs'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function run({ cmd, args, env }) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: 'inherit', env })
  if (result.error) {
    console.error(result.error.message)
    exit(1)
  }
  if (result.status !== 0) exit(result.status ?? 1)
}

function npmPrefix() {
  const result = spawnSync('npm', ['prefix', '-g'], { encoding: 'utf8' })
  const prefix = result.stdout?.trim() ?? ''
  if (result.status !== 0 || !prefix) {
    console.error('npm prefix -g failed')
    exit(1)
  }
  return { prefix }
}

function installGlobalPnpm({ version }) {
  const args = ['install', '-g', `pnpm@${version}`, '--foreground-scripts']
  const allowed = spawnSync('npm', [...args, '--allow-scripts=pnpm'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  if (allowed.status === 0) return
  run({ cmd: 'npm', args, env: process.env })
}

function ensurePnpm() {
  const { version } = pnpmVersion()
  let resolved = resolveGlobalPnpm({ ...npmPrefix(), version })
  if (resolved.cmd) return resolved
  installGlobalPnpm({ version })
  resolved = resolveGlobalPnpm({ ...npmPrefix(), version })
  if (!resolved.cmd) {
    console.error('global pnpm is missing after npm install -g')
    exit(1)
  }
  return resolved
}

const argv = process.argv.slice(2)
const pnpmArgs = argv.length === 0 ? ['install'] : argv
const { cmd, argsPrefix, env } = ensurePnpm()
run({ cmd, args: [...argsPrefix, ...pnpmArgs], env })
