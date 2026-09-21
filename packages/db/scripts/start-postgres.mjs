#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const skip = process.env.SKIP_DB_START === '1' || process.env.SKIP_DB_START === 'true'
if (skip) process.exit(0)

const result = spawnSync('supabase', ['start'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
