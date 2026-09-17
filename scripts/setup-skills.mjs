#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit, platform } from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(scriptDir, '..')
const lockPath = join(repoRoot, 'skills-lock.json')
const githubCatalog = 'blockmatic/basilic-skills'
const allowLocal = process.env.BASILIC_SKILLS_LOCAL === '1'

function localSkillNames({ skills }) {
  return {
    names: Object.entries(skills)
      .filter(([, skill]) => skill.sourceType === 'local')
      .map(([name]) => name),
  }
}

function githubSources({ skills }) {
  return {
    sources: [
      ...new Set(
        Object.values(skills)
          .filter(skill => skill.sourceType === 'github' && skill.source)
          .map(skill => skill.source),
      ),
    ],
  }
}

function resolveCatalog({ allowLocal, repoRoot }) {
  if (!allowLocal) return { source: githubCatalog }
  const localCatalog = join(repoRoot, '..', 'basilic-skills')
  if (existsSync(join(localCatalog, 'skills', 'workflow', 'SKILL.md')))
    return { source: localCatalog }
  return {
    error: 'BASILIC_SKILLS_LOCAL=1 but ../basilic-skills/skills/workflow/SKILL.md is missing',
  }
}

function runSkillsAdd({ source }) {
  const isWindows = platform === 'win32'
  const result = spawnSync(
    isWindows ? 'pnpm.cmd' : 'pnpm',
    ['dlx', 'skills@latest', 'add', source, '--skill', '*', '-a', 'cursor', '--copy', '-y'],
    { cwd: repoRoot, stdio: 'inherit', shell: isWindows },
  )
  if (result.error) {
    console.error(result.error.message)
    exit(1)
  }
  if (result.status !== 0) exit(result.status ?? 1)
}

function main() {
  if (!existsSync(lockPath)) {
    console.error('skills-lock.json is missing; cannot install agent skills')
    exit(1)
  }

  const snapshot = readFileSync(lockPath, 'utf8')
  const skills = JSON.parse(snapshot).skills ?? {}
  const { names } = localSkillNames({ skills })
  if (names.length > 0 && !allowLocal) {
    console.error(
      `skills-lock.json has local sources (${names.join(', ')}). Point them at GitHub, or set BASILIC_SKILLS_LOCAL=1 for a maintainer preview.`,
    )
    exit(1)
  }

  const { sources } = githubSources({ skills })
  if (sources.length !== 1 || sources[0] !== githubCatalog) {
    console.error(
      `skills-lock.json must pin only ${githubCatalog} (found ${sources.join(', ') || 'none'}). Do not add a second catalog; vendor into basilic-skills.`,
    )
    exit(1)
  }

  const { source, error } = resolveCatalog({ allowLocal, repoRoot })
  if (error || !source) {
    console.error(error ?? 'could not resolve skills catalog')
    exit(1)
  }

  runSkillsAdd({ source })
  writeFileSync(lockPath, snapshot)
}

main()
