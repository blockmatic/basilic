#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { exit } from 'node:process'

const BLOCKED_PATTERNS = [
  /^\.env$/,
  /\.env$/,
  /\.pem$/,
  /\.key$/,
  /^id_rsa/,
  /id_rsa$/,
  /\.p12$/,
  /\.pfx$/,
  /\.jks$/,
  /\.keystore$/,
  /\.crt$/,
  /\.cer$/,
  /\.der$/,
  /\.p7b$/,
  /\.p7c$/,
  /\.p7m$/,
  /\.p7s$/,
  /\.pfx$/,
  /\.p12$/,
  /\.keytab$/,
]

const ALLOWED_PATTERNS = [
  /\.env-example$/,
  /\.env\.example$/,
  /\.env\.schema$/,
  /\.env\.development$/,
  /\.env\.staging$/,
  /\.env\.production$/,
  /\.env\.test$/,
]

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  } catch (error) {
    console.error('Error getting staged files:', error.message)
    exit(1)
  }
}

function isBlocked(filename) {
  for (const allowed of ALLOWED_PATTERNS) {
    if (allowed.test(filename)) {
      return false
    }
  }

  for (const blocked of BLOCKED_PATTERNS) {
    if (blocked.test(filename)) {
      return true
    }
  }

  return false
}

const stagedFiles = getStagedFiles()
const blockedFiles = stagedFiles.filter(isBlocked)

if (blockedFiles.length > 0) {
  console.error('\n❌ Security check failed: Attempting to commit sensitive files\n')
  console.error('Blocked files:')
  blockedFiles.forEach(file => {
    console.error(`  - ${file}`)
  })
  console.error('\nThese file types contain sensitive data and should not be committed.')
  console.error(
    'Allowed exceptions: .env-example, .env.example, .env.schema, .env.{development,staging,production,test}',
  )
  console.error(
    '\nIf you need to commit a configuration template, use .env-example or .env.schema instead.\n',
  )
  exit(1)
}

exit(0)
