#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(scriptDir)
const deepsecDir = join(repoRoot, '.deepsec')
const projectId = 'basilic'

const credentialKeys = [
  'AI_GATEWAY_API_KEY',
  'VERCEL_OIDC_TOKEN',
  'ANTHROPIC_AUTH_TOKEN',
  'OPENAI_API_KEY',
]

const setupDocUrl = 'https://github.com/vercel-labs/deepsec/blob/main/docs/vercel-setup.md'

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const vars = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1)
    vars[key] = value
  }
  return vars
}

function hasAiCredential() {
  for (const key of credentialKeys) if (process.env[key]?.trim()) return true

  const envLocal = parseEnvFile(join(deepsecDir, '.env.local'))
  for (const key of credentialKeys) if (envLocal[key]?.trim()) return true

  return false
}

function runInDeepsec(command, { optionalLimit } = {}) {
  const limit = process.env.DEEPSEC_LIMIT?.trim()
  const limitArg = optionalLimit && limit ? ` --limit ${limit}` : ''
  execSync(`pnpm deepsec ${command}${limitArg}`, {
    cwd: deepsecDir,
    stdio: 'inherit',
    env: process.env,
  })
}

function ensureDeepsecWorkspace() {
  if (!existsSync(deepsecDir)) {
    console.error('\n❌ .deepsec/ workspace not found.\n')
    console.error('Run once from the repo root:')
    console.error('  pnpm setup:deepsec')
    console.error('  cd .deepsec && pnpm install')
    console.error('  # set AI_GATEWAY_API_KEY in .deepsec/.env.local')
    console.error('  # fill .deepsec/data/<id>/INFO.md (see deepsec init output)\n')
    exit(1)
  }

  if (!existsSync(join(deepsecDir, 'node_modules'))) {
    console.log('\n📦 Installing deepsec dependencies in .deepsec/...\n')
    execSync('pnpm install', { cwd: deepsecDir, stdio: 'inherit' })
  }
}

function ensureCredentials() {
  if (hasAiCredential()) return

  console.error('\n❌ No deepsec AI credentials found.\n')
  console.error('Set one of these in .deepsec/.env.local or your shell:')
  console.error('  AI_GATEWAY_API_KEY, VERCEL_OIDC_TOKEN, ANTHROPIC_AUTH_TOKEN, OPENAI_API_KEY')
  console.error(`\nSetup: ${setupDocUrl}\n`)
  exit(1)
}

function main() {
  const mode = process.argv[2] ?? 'pr'
  if (mode !== 'pr' && mode !== 'full') {
    console.error('\nUsage: node scripts/run-deepsec.mjs <pr|full>\n')
    exit(1)
  }

  ensureDeepsecWorkspace()
  ensureCredentials()

  console.log(`\n🔒 Running deepsec (${mode} mode)...\n`)

  if (mode === 'pr') {
    runInDeepsec(`process --diff origin/main --project-id ${projectId}`)
    console.log('\n✅ deepsec PR review finished (exit 0 = no net-new findings).\n')
    return
  }

  runInDeepsec('scan')
  runInDeepsec('process', { optionalLimit: true })
  console.log('\n✅ deepsec full scan finished.\n')
}

try {
  main()
} catch (error) {
  const code = typeof error.status === 'number' ? error.status : 1
  if (code === 1)
    console.error('\n⚠️  deepsec reported findings or a non-zero exit. Review output above.\n')
  else console.error('\n❌ deepsec failed.\n')
  exit(code)
}
