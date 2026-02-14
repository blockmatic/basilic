#!/usr/bin/env node
/**
 * E2E wrapper: parses --api URL param, sets env, forwards to Playwright.
 * Param formats: --api=URL, --api URL
 * Defaults: PLAYWRIGHT_API_URL or NEXT_PUBLIC_API_URL or http://localhost:3001
 */
const args = process.argv.slice(2)
const rest = []
let apiUrl =
  process.env.PLAYWRIGHT_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  const eqMatch = arg.match(/^--api=(.+)$/)
  if (eqMatch) {
    apiUrl = eqMatch[1]
    continue
  }
  if (arg === '--api' && args[i + 1]) {
    apiUrl = args[++i]
    continue
  }
  rest.push(arg)
}

process.env.PLAYWRIGHT_API_URL = apiUrl

import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const fastifyDir = dirname(scriptDir)

const pw = spawn('pnpm', ['exec', 'playwright', 'test', ...rest], {
  cwd: fastifyDir,
  stdio: 'inherit',
  env: process.env,
})
pw.on('exit', code => process.exit(code ?? 1))
