#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit, platform } from 'node:process'
import { fileURLToPath } from 'node:url'
import { skillInstallGroups } from './skills-lock-manifest.mjs'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(scriptDir, '..')

function removeAgentSkillSymlinks() {
  for (const dir of ['.claude', join('.cursor', 'skills')]) {
    const path = join(repoRoot, dir)
    if (existsSync(path)) rmSync(path, { recursive: true, force: true })
  }
}

function runSkillsAdd({ source, skillNames }) {
  const isWindows = platform === 'win32'
  const args = ['dlx', 'skills@latest', 'add', source, '-y', '--agent', 'cursor']
  for (const name of skillNames) args.push('--skill', name)
  const result = spawnSync(isWindows ? 'pnpm.cmd' : 'pnpm', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: isWindows,
  })
  if (result.error) {
    console.error(result.error.message)
    exit(1)
  }
  if (result.status !== 0) exit(result.status ?? 1)
  removeAgentSkillSymlinks()
}

function main() {
  for (const { source, skills } of skillInstallGroups) {
    runSkillsAdd({ source, skillNames: skills })
  }
  removeAgentSkillSymlinks()
}

main()
