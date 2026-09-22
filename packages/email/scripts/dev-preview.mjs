#!/usr/bin/env node
/**
 * React Email ignores PORT. Pass Portless's assigned port through -p.
 */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const port = process.env.PORT ?? '3000'
const child = spawn('pnpm', ['exec', 'email', 'dev', '-p', port], {
  cwd: packageRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
child.on('exit', code => process.exit(code ?? 1))
