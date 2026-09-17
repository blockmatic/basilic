#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pnpmHome = join(tmpdir(), 'basilic-pnpm-home')

export function pnpmVersion() {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
  const match =
    typeof pkg.packageManager === 'string' ? pkg.packageManager.match(/^pnpm@([^+]+)/) : null
  if (!match) {
    console.error('package.json is missing a pnpm packageManager field')
    exit(1)
  }
  return { version: match[1] }
}

export function pnpmEnv({ prefix }) {
  return {
    env: {
      ...process.env,
      PATH: `${join(prefix, 'bin')}${delimiter}${process.env.PATH ?? ''}`,
      PNPM_HOME: pnpmHome,
      npm_config_manage_package_manager_versions: 'false',
    },
  }
}

export function pnpmVersionMatches({ cmd, argsPrefix, env, version, spawn = spawnSync }) {
  const probe = spawn(cmd, [...argsPrefix, '--version'], { encoding: 'utf8', env })
  return probe.status === 0 && probe.stdout?.trim() === version
}

export function resolveGlobalPnpm({ prefix, version, spawn = spawnSync }) {
  const { env } = pnpmEnv({ prefix })
  const bin = join(prefix, 'bin', 'pnpm')
  const mjs = join(prefix, 'lib', 'node_modules', 'pnpm', 'bin', 'pnpm.mjs')
  if (existsSync(bin) && pnpmVersionMatches({ cmd: bin, argsPrefix: [], env, version, spawn }))
    return { cmd: bin, argsPrefix: [], env }
  if (
    existsSync(mjs) &&
    pnpmVersionMatches({ cmd: process.execPath, argsPrefix: [mjs], env, version, spawn })
  )
    return { cmd: process.execPath, argsPrefix: [mjs], env }
  return { cmd: null, argsPrefix: [], env }
}
