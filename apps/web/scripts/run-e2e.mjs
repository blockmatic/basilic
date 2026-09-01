#!/usr/bin/env node
/**
 * E2E wrapper: parses --app/--api URL params, sets env, forwards to Playwright.
 * Param formats: --app=URL, --app URL, --api=URL, --api URL
 * Precedence: CLI args (--app/--api) > PLAYWRIGHT_* > NEXT_PUBLIC_* > localhost
 */
const args = process.argv.slice(2)
const rest = []
let appUrl =
  process.env.PLAYWRIGHT_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
let apiUrl =
  process.env.PLAYWRIGHT_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  const eqMatch = arg.match(/^--(app|api)=(.+)$/)
  if (eqMatch) {
    if (eqMatch[1] === 'app') appUrl = eqMatch[2]
    else apiUrl = eqMatch[2]
    continue
  }
  if (arg === '--app' && args[i + 1]) {
    appUrl = args[++i]
    continue
  }
  if (arg === '--api' && args[i + 1]) {
    apiUrl = args[++i]
    continue
  }
  rest.push(arg)
}

process.env.PLAYWRIGHT_APP_URL = appUrl
process.env.PLAYWRIGHT_API_URL = apiUrl

import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const nextDir = dirname(scriptDir)

const hasWorkers = rest.some(a => a.startsWith('--workers='))
const pwTestArgs = [...(hasWorkers ? [] : ['--workers=1']), ...rest]
const pwArgs = ['exec', 'playwright', 'test', ...pwTestArgs]

const pw = spawn('pnpm', pwArgs, {
  cwd: nextDir,
  stdio: 'inherit',
  env: process.env,
})
pw.on('exit', code => process.exit(code ?? 1))
