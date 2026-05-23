#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const deepsecDir = join(repoRoot, '.deepsec')

function main() {
  console.log('\n📦 Setting up deepsec...\n')

  try {
    if (!existsSync(deepsecDir)) {
      console.log('Scaffolding .deepsec/ workspace...')
      execSync('npx deepsec@latest init', { cwd: repoRoot, stdio: 'inherit' })
    } else console.log('.deepsec/ already exists — skipping init')

    if (existsSync(join(deepsecDir, 'package.json'))) {
      console.log('\nInstalling deepsec dependencies...')
      execSync('pnpm install', { cwd: deepsecDir, stdio: 'inherit' })
    }

    console.log('\n✅ deepsec setup complete.')
    console.log('Next: set AI_GATEWAY_API_KEY in .deepsec/.env.local')
    console.log('      fill .deepsec/data/basilic/INFO.md (see deepsec init output)\n')
    exit(0)
  } catch (_error) {
    console.error('\n⚠️  deepsec setup failed (optional)')
    console.error('Run manually: pnpm setup:deepsec\n')
    exit(0)
  }
}

main()
