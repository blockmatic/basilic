#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { exit, platform } from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(scriptDir, '..')
const lockPath = join(repoRoot, 'skills-lock.json')
const ownedListPath = join(scriptDir, 'owned-agent-skills.txt')
const basilicCatalog = 'blockmatic/basilic-skills'
const allowedGithub = new Set([
  basilicCatalog,
  'miqdadbadjuber/anti-slop',
  'jakubkrehel/make-interfaces-feel-better',
])
const allowLocal = process.env.BASILIC_SKILLS_LOCAL === '1'

function ownedSkillNames() {
  return {
    names: readFileSync(ownedListPath, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean),
  }
}

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

function extraGithubSkills({ skills }) {
  return {
    skills: Object.entries(skills)
      .filter(
        ([, skill]) =>
          skill.sourceType === 'github' && skill.source && skill.source !== basilicCatalog,
      )
      .map(([name, skill]) => ({ name, source: skill.source })),
  }
}

function resolveBasilicCatalog() {
  if (!allowLocal) return { source: basilicCatalog }
  const localCatalog = join(repoRoot, '..', 'basilic-skills')
  if (existsSync(join(localCatalog, 'skills', 'w-plan', 'SKILL.md')))
    return { source: localCatalog }
  return {
    error: 'BASILIC_SKILLS_LOCAL=1 but ../basilic-skills/skills/w-plan/SKILL.md is missing',
  }
}

function runSkillsAdd({ source, skill }) {
  const isWindows = platform === 'win32'
  const args = ['dlx', 'skills@latest', 'add', source]
  if (skill) args.push('--skill', skill)
  else args.push('--all')
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
}

function stashOwned({ names, skillsDir }) {
  const stashDir = mkdtempSync(join(tmpdir(), 'basilic-owned-skills-'))
  for (const name of names) {
    const from = join(skillsDir, name)
    if (!existsSync(from)) continue
    cpSync(from, join(stashDir, name), { recursive: true })
  }
  return { stashDir }
}

function restoreOwned({ names, skillsDir, stashDir }) {
  for (const name of names) {
    const from = join(stashDir, name)
    if (!existsSync(from)) continue
    rmSync(join(skillsDir, name), { recursive: true, force: true })
    cpSync(from, join(skillsDir, name), { recursive: true })
  }
  rmSync(stashDir, { recursive: true, force: true })
}

function pruneForeignSkills({ names, extraNames, skillsDir }) {
  const keep = new Set([...names, ...extraNames])
  for (const name of readdirSync(skillsDir)) {
    if (keep.has(name) || name.startsWith('w-')) continue
    rmSync(join(skillsDir, name), { recursive: true, force: true })
  }
}

function main() {
  if (!existsSync(lockPath)) {
    console.error('skills-lock.json is missing; cannot install agent skills')
    exit(1)
  }

  const snapshot = readFileSync(lockPath, 'utf8')
  const skills = JSON.parse(snapshot).skills ?? {}
  const { names: localNames } = localSkillNames({ skills })
  if (localNames.length > 0 && !allowLocal) {
    console.error(
      `skills-lock.json has local sources (${localNames.join(', ')}). Point them at GitHub, or set BASILIC_SKILLS_LOCAL=1 for a maintainer preview.`,
    )
    exit(1)
  }

  const { sources } = githubSources({ skills })
  const unexpected = sources.filter(source => !allowedGithub.has(source))
  if (unexpected.length > 0) {
    console.error(
      `skills-lock.json has unsupported catalogs (${unexpected.join(', ')}). Allowed: ${[...allowedGithub].join(', ')}.`,
    )
    exit(1)
  }
  if (!sources.includes(basilicCatalog) && !allowLocal) {
    console.error(`skills-lock.json must pin ${basilicCatalog}`)
    exit(1)
  }

  const { source, error } = resolveBasilicCatalog()
  if (error || !source) {
    console.error(error ?? 'could not resolve basilic-skills catalog')
    exit(1)
  }

  const { names } = ownedSkillNames()
  const { skills: extraSkills } = extraGithubSkills({ skills })
  const extraNames = extraSkills.map(skill => skill.name)
  const skillsDir = join(repoRoot, '.agents/skills')
  const { stashDir } = stashOwned({ names, skillsDir })
  try {
    runSkillsAdd({ source })
    for (const extra of extraSkills) runSkillsAdd({ source: extra.source, skill: extra.name })
  } finally {
    restoreOwned({ names, skillsDir, stashDir })
  }

  const installed = JSON.parse(readFileSync(lockPath, 'utf8'))
  if (process.env.BASILIC_SKILLS_WRITE_LOCK === '1') {
    for (const [name, skill] of Object.entries(installed.skills ?? {})) {
      if (skill.sourceType !== 'local') continue
      skill.source = basilicCatalog
      skill.sourceType = 'github'
      if (!skill.skillPath) skill.skillPath = `skills/${name}/SKILL.md`
    }
    writeFileSync(lockPath, `${JSON.stringify(installed, null, 2)}\n`)
  } else writeFileSync(lockPath, snapshot)

  pruneForeignSkills({ names, extraNames, skillsDir })
}

main()
