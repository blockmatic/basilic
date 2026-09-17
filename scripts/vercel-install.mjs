#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pnpmHome = join(tmpdir(), 'basilic-pnpm-home')

function run({ cmd, args, env }) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: 'inherit', env })
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

function npmPrefix() {
  const result = spawnSync('npm', ['prefix', '-g'], { encoding: 'utf8' })
  const prefix = result.stdout?.trim() ?? ''
  if (result.status !== 0 || !prefix) {
    console.error('npm prefix -g failed')
    exit(1)
  }
  return { prefix }
}

function pnpmEnv({ prefix }) {
  return {
    env: {
      ...process.env,
      PATH: `${join(prefix, 'bin')}${delimiter}${process.env.PATH ?? ''}`,
      PNPM_HOME: pnpmHome,
      npm_config_manage_package_manager_versions: 'false',
    },
  }
}

function pnpmVersionMatches({ cmd, argsPrefix, env, version }) {
  const probe = spawnSync(cmd, [...argsPrefix, '--version'], { encoding: 'utf8', env })
  return probe.status === 0 && probe.stdout?.trim() === version
}

function resolveGlobalPnpm({ prefix, version }) {
  const { env } = pnpmEnv({ prefix })
  const bin = join(prefix, 'bin', 'pnpm')
  const mjs = join(prefix, 'lib', 'node_modules', 'pnpm', 'bin', 'pnpm.mjs')
  if (existsSync(bin) && pnpmVersionMatches({ cmd: bin, argsPrefix: [], env, version }))
    return { cmd: bin, argsPrefix: [], env }
  if (
    existsSync(mjs) &&
    pnpmVersionMatches({ cmd: process.execPath, argsPrefix: [mjs], env, version })
  )
    return { cmd: process.execPath, argsPrefix: [mjs], env }
  return { cmd: null, argsPrefix: [], env }
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
