#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { exit } from 'node:process'

const root = process.cwd()
const srcRoot = join(root, '.agents/skills')
const lock = JSON.parse(readFileSync(join(root, 'skills-lock.json'), 'utf8'))

if (!existsSync(srcRoot)) {
  console.error(
    'Missing .agents/skills — run pnpm dlx skills@latest add blockmatic/basilic-skills first',
  )
  exit(1)
}

for (const [name, entry] of Object.entries(lock.skills)) {
  const src = join(srcRoot, name)
  if (!existsSync(src)) continue
  const isWorkflow = entry.skillPath?.includes('/workflow/')
  const dest = join(root, '.cursor/skills', isWorkflow ? `workflow/${name}` : name)
  execSync(`rsync -a "${src}/" "${dest}/"`, { stdio: 'inherit' })
}

rmSync(join(root, '.agents'), { recursive: true, force: true })
console.log('Synced .agents/skills → .cursor/skills and removed .agents/')
